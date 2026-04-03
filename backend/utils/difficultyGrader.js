/**
 * Difficulty grader for GitHub issues.
 * 
 * Exports:
 *  - gradeIssue(issue, options) -> { score: number, level: string, breakdown: {...} }
 * 
 * The function is defensive, configurable and returns both a numeric score (0..100) and and easy-to-consume level label
 */

const DEFAULT_CONFIG = {
    // relative importance of each factor
    weights: {
        comments: 1.0,
        reactions: 0.8,
        labels: 1.6,
        body: 1.0,
        codeBlocks: 0.6,
        daysOpen: 0.9,
        assignees: -0.7,  // more assignees -> likely easier(negative weight decreases difficulty)
        linkedPRs: -1.5,
    },

    // Thresholds for label-based scoring (label names lowercased)
    labelScores: {
        'good first issue': -25,
        beginner: -20,
        'help wanted': -5,
        bug: 10,
        enhancement: 15,
        complex: 30,
        'needs design': 20,
        'documentation': -10
    },

    // Mapping numeric final score to difficulty levels
    thresholds: {
        easy: 30,
        medium: 60,
        hard: 85
    },

    // Caps (for normalization)
    caps: {
        maxComments: 200,
        maxReactions: 200,
        maxDaysOpen: 365,
        maxBodyLength: 5000,
        maxCodeBlocks: 20,
        maxAssignees: 5,
        maxLinkedPRs: 5
    }
};

function _safeInt(n) {
    const v = Number(n ?? 0);
    return Number.isFinite(v) ? Math.floor(v): 0;
}

function _clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function _normalize(value, cap) {
    // Return 0..1
    if (cap <= 0) return 0;
    return _clamp(value / cap, 0, 1);
}

/**
 * gradeIssue(issue, options)
 * @param {Object} issue - GitHub issue-like object. Fields used (all optional):
 *  - comments (number)
 *  - reactions (object) or reactions.total_count
 *  - labels (array of {name})
 *  - body (string)
 *  - created_at (ISO date string / timestamp)
 *  - assignees (array)
 *  - linked_pr_count (number) - optional 
 * @param {Object} options - optional config overrides
 * @returns {Object} { score: number (0-100), level: string, breakdown: {...} }
 */

function gradeIssue(issue = {}, options = {}) {
    const cfg = {
        ...DEFAULT_CONFIG,
        ...(options.config || {}),
        weights: { ...DEFAULT_CONFIG.weights, ...(options.config?.weights || {}) },
        labelScores: {...DEFAULT_CONFIG.labelScores, ...(options.config?.labelScores || {}) },
        caps: {...DEFAULT_CONFIG.caps, ...(options.config?.caps || {}) },
        thresholds: {...DEFAULT_CONFIG.thresholds, ...(options.config?.thresholds || {}) },
    };

    //Defensive parsing
    const comments = _safeInt(issue.comments);

    let reactionsCount = 0;
    if (issue.reactions && typeof issue.reactions === 'object') {
        if (typeof issue.reactions.total_count === 'number') {
            reactionsCount = _safeInt(issue.reactions.total_count);
        } else {
            reactionsCount = Object.values(issue.reactions)
                .map(v => Number(v) || 0)
                .reduce((a, b) => a + b, 0);
        }
    } else {
        reactionsCount = _safeInt(issue.reactions ?? 0);
    }

    const labels = Array.isArray(issue.labels)
        ? issue.labels.map(l => (typeof l === 'string' ? l : (l?.name ?? '')).toLowerCase())
        : [];

    const body = typeof issue.body === 'string' ? issue.body : String(issue.body ?? '');
    const bodyLength = body.length;
    const codeBlockCount = (body.match(/```/g) || []).length; // rough indicator of code blocks
    const assignees = Array.isArray(issue.assignees) ? issue.assignees.length : 0;
    const linkedPRs = _safeInt(issue.linked_pr_count ?? 0);

    // parse created_at safely
    let daysOpen = 0;
    try {
        const created = issue.created_at ? new Date(issue.created_at) : null;
        if (created && !isNaN(created.getTime())) {
            daysOpen = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        } else {
            daysOpen = 0;
        }
    } catch (e) {
        daysOpen = 0;
    }

    // Normalize each factor into 0..1 (higher = more difficult), then weight them
    // For factors where *more* count = easier (eg. assignees, linked PRs), we invert the normalized value (1 - norm)

    const caps = cfg.caps;

    // Comments: More comments usually means easier so we invert
    const commentsNorm = 1 - _normalize(comments, caps.maxComments);

    // Reactions: More reactions usually means more attention and thus, easier so we invert
    const reactionsNorm = 1 -_normalize(reactionsCount, caps.maxReactions);

    // labels: compute additive label score, then convert to normalized 0..1
    let labelRawScore = 0;
    for (const l of labels) {
        if (l in cfg.labelScores) {
            labelRawScore += cfg.labelScores[l];
        } else {
            // Heuristics: Common words
            if (l.includes('good first') || l.includes('first-timers')) labelRawScore += cfg.labelScores['good first issue'] ?? -25;
            if (l.includes('docs') || l.includes('documentation')) labelRawScore += cfg.labelScores.documentation ?? -10;
            if (l.includes('urgent') || l.includes('blocker')) labelRawScore += 25;
        }
    }
    // Map labelRawScore (which can be negative) to 0..1. Expect range roughly [-50...+50]
    const labelCap = 50;
    const labelNorm = _clamp((labelRawScore + labelCap) / (labelCap * 2), 0, 1);

    // Body length: longer = more difficult
    const bodyNorm = _normalize(bodyLength, caps.maxBodyLength);

    // Code Blocks: more code snippets  often mean technical complexity
    const codeBlocksNorm = _normalize(codeBlockCount, caps.maxCodeBlocks);

    // Days Open: older -> possibly harder
    const daysOpenNorm = _normalize(daysOpen, caps.maxDaysOpen);

    // Assignees: more assignees -> easier (invert)
    const assigneesNorm = 1 - _normalize(assignees, caps.maxAssignees);

    // Linked PRs: more linked PRs (or merged PRs) -> easier (invert)
    const linkedPRsNorm = 1 - _normalize(linkedPRs, caps.maxLinkedPRs);

    // Weighted sum (unnormalized)
    const w = cfg.weights;
    const weighted = 
        commentsNorm * (w.comments ?? 0) +
        reactionsNorm * (w.reactions ?? 0) +
        labelNorm * (w.labels ?? 0) +
        bodyNorm * (w.body ?? 0) +
        codeBlocksNorm * (w.codeBlocks ?? 0) +
        daysOpenNorm * (w.daysOpen ?? 0) +
        assigneesNorm * (w.assignees ?? 0) +
        linkedPRsNorm * (w.linkedPRs ?? 0);

    // Normalize final to 0..100 using sum of positives weights (so scale makes sense)
    const positiveWeights = Object.entries(w)
        .filter(([, val]) => val > 0)
        .map(([, val]) => val)
        .reduce((a, b) => a + b, 0) || 1;

    // Compute final results
    let rawScore01 = weighted / positiveWeights; // Might slightly exceed 1 if labelNorm=1 and weights positive; clamp
    rawScore01 = _clamp(rawScore01, 0, 1);

    const score = Math.round(rawScore01 * 100);

    // Map to label
    const t = cfg.thresholds;
    let level;
    if (score <= t.easy) level = 'Easy';
    else if (score <= t.medium) level = 'Medium';
    else if (score <= t.hard) level = 'Hard';
    else level = 'Very Hard';

    const breakdown = {
        comments: {  raw: comments, norm: Number(commentsNorm.toFixed(3)), weight: w.comments },
        reactions: { raw: reactionsCount, norm: Number(reactionsNorm.toFixed(3)), weight: w.reactions },
        labels: { raw: labelRawScore, norm: Number(labelNorm.toFixed(3)), weight: w.labels, matched: labels },
        body: { raw: bodyLength, norm: Number(bodyNorm.toFixed(3)), weight: w.body },
        codeBlocks: { raw: codeBlockCount, norm: Number(codeBlocksNorm.toFixed(3)), weight: w.codeBlocks },
        daysOpen: { raw: Math.round(daysOpen), norm: Number(daysOpenNorm.toFixed(3)), weight: w.daysOpen },
        assignees: { raw: assignees, norm: Number(assigneesNorm.toFixed(3)), weight: w.assignees },
        linkedPRs: { raw: linkedPRs, norm: Number(linkedPRsNorm.toFixed(3)), weight: w.linkedPRs },
        weighted,
        positiveWeights,
        rawScore01
    };

    return { score, level, breakdown };
}

export { gradeIssue };