import express from 'express';
const router = express.Router();

import { fetchIssuesForDifficulty } from '../services/githubService.js';
import { gradeIssue } from '../utils/difficultyGrader.js';

router.get('/daily-challenge', async (req, res) => {
    try {
        // TEMP: until auth exists
        const userSkill = req.query.skill || 'Beginner';

        const difficultyMap = {
            Beginner: 'Easy',
            beginner: 'Easy',
            Junior: 'Medium',
            junior: 'Medium',
            Intermediate: 'Medium',
            intermediate: 'Medium',
            Advanced: 'Hard',
            advanced: 'Hard'
        };

        const targetDifficulty = difficultyMap[userSkill] || 'Easy';

        console.log(`Fecthing ${targetDifficulty} challenge for ${userSkill} user`);

        // Fetch candidates
        const issues = await fetchIssuesForDifficulty(targetDifficulty);

        if (!issues.length) {
            return res.json({
                title: 'No challenge today',
                body: 'Check back tomorrow for a new issue.',
                html_url: '#',
                difficulty: targetDifficulty,
                userSkill
            });
        }

        // Grade + Filter
        const graded = issues
            .map(issue => ({
                issue,
                grading: gradeIssue(issue)
            }))
            .filter(item => item.grading.level === targetDifficulty);

        // Pick one randomly 
        const candidates = graded.length > 0 ? graded : issues.map(issue => ({
            issue,
            grading: gradeIssue(issue)
        }));

        const selected = 
            candidates[Math.floor(Math.random() * candidates.length)];
        
        res.json({
            ...selected.issue,
            difficulty: selected.grading.level,
            difficultyScore: selected.grading.score,
            userSkill,
            matchQuality: graded.length > 0 ? 'exact' : 'approximate'
        });
    } catch (err) {
        console.error('Daily challenge error:', err);
        res.status(500).json({ error: 'Daily challenge failed', message: err.message });
    }
});

export default router;

