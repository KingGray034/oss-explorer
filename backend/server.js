import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import Groq from 'groq-sdk/index.mjs';
import challengeRouter from './routes/challenges.js';

const app = express();
const PORT = process.env.PORT || 5000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN_2;

if (!GITHUB_TOKEN) {
    console.warn("Warning: GITHUB_TOKEN_2 is missing from .env API requests may fail.");
}

const githubHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OSS-Explorer-App'
};

const groq = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY
}) : null;

app.use(cors());
app.use(express.json());
app.use('/api', challengeRouter);

const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const aiSummaryCache = new Map();
const AI_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Rate limiting middleware
const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 25,
    message: { error: 'Too many search requests. Please wait a minute' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`Rate limit hit for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many search requests. Please wait a minute',
            retryAfter: 60
        });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.get('/api/github/search', searchLimiter, async (req, res) => {
    try {
        const { q, sort = 'updated', order = 'desc', per_page = 20 } = req.query;

        const cacheKey = `${q}-${sort}-${order}-${per_page}`;

        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached result for:', q);
            return res.json(cached.data);
        }

        console.log('Cache miss, fetching from GitHub:', q)

        const queryString = `q=${q}&sort=${sort}&order=${order}&per_page=${per_page}`;

        // Make a request to GitHub API
        const response = await fetch(
            `https://api.github.com/search/issues?${queryString}`,
            { headers: githubHeaders }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('GitHub API error:', response.status);
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const data = await response.json();
        // Store in cache
        searchCache.set(cacheKey, { data, timestamp: Date.now() });
        console.log('cached result for:', q);

        res.json(data);
    } catch (error) {
        // Handle errors
        console.error('GitHub API error:', error);
        res.status(500).json({ error: 'Failed to fetch from GitHub API' });
    }
});

// Route to fetch repo files (README, CONTRIBUTING)
app.get('/api/github/repo-files/:owner/:repo/:fileType', async (req, res) => {
    try {
        const { owner, repo, fileType } = req.params;
        let fileName = fileType;

        if (fileName === 'readme') {
            fileName = 'README.md';
        } else if (fileType === 'contributing') {
            fileName = 'CONTRIBUTING.md';
        }

        const response = await fetch (
            `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`,
            { headers: githubHeaders }
        );

        if (!response.ok) {
            const lowercaseResponse = await fetch (
                `https://api.github.com/repos/${owner}/${repo}/contents/${fileName.toLowerCase()}`,
                { headers: githubHeaders }
            );

            if (!lowercaseResponse.ok) {
                return res.json({ content: '' });
            }

            const data = await lowercaseResponse.json();
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return res.json({ content });
        } 

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        res.json({ content });
    } catch (error) {
        console.error('Repo files:' , error);
        res.status(500).json({ error: 'Failed to fetch repository files' });
    }
});

// Route to get README content specifically 
app.get('/api/github/repo-files/:owner/:repo/readme', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        // Try different README file names
        const readmeNames = ['README.md', 'readme.md', 'README', 'readme'];

        for (const fileName of readmeNames) {
            try {
                const response = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`,
                    { headers: githubHeaders }
                );

                if (response.ok) {
                    const data = await response.json();
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');
                    return res.json({ readme: content, contributing: '' });
                }
            } catch (err) {
                continue; 
            } 
        }
        // If no README found, return empty
        res.json({ readme: '', contributing: '' });
    } catch (error) {
        console.error('README fetch error:', error);
        res.status(500).json({ readme: '', contributing: '' });
    }
});

// Route for AI summarization using InferenceClient
app.post('/api/ai/summarize', async (req, res) => {
    try {
        const { issueDescription, readmeContent, repoName, issueUrl } = req.body;

        if(!issueDescription || issueDescription.trim().length === 0) {
            return res.json({ summary: 'No issue description provided' });
        }
        const cacheKey = issueUrl || `${repoName}-${issueDescription.substring(0, 100)}`;

        const cached = aiSummaryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < AI_CACHE_DURATION) {
            console.log('Returning cached AI summary for:', issueUrl || repoName);
            return res.json({ summary: cached.summary, fromCache: true });
        }

        if (!groq || !process.env.GROQ_API_KEY) {
            console.warn('GROQ_API_KEY_KEY missing, using fallback');
            const fallback = issueDescription.substring(0, 200) + '...';
            return res.json({ summary: fallback });
        }

        const cleanedIssue = issueDescription.trim();

        let contextMessage = '';
        if (readmeContent && readmeContent.trim().length > 0) {
            const readmeSnippet = readmeContent.trim().substring(0, 1000);
            contextMessage = `Context: This issue is from the ${repoName} repository. Project info: ${readmeSnippet}\n\n`;
        }

        console.log('Calling Groq API for:', issueUrl || repoName);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that explains GitHub issues on simple, clear language. Keep explanations concise (2-3 sentences max) but informative. Focus on what the issue is about and what needs to be done.'
                },
                {
                    role: 'user',
                    content: `${contextMessage} Explain this GitHub issue clearly:\n\n${cleanedIssue}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 200,
            top_p: 1,
            stream: false
        });

        const summary = chatCompletion.choices[0]?.message?.content?.trim();

        if (!summary || summary.length < 20) {
            const fallback = cleanedIssue.substring(0, 200) + '...';
            return res.json({ summary: fallback });
        }

        aiSummaryCache.set(cacheKey, {
            summary,
            timestamp: Date.now()
        });

        console.log('Cached new AI summary. Cache size:', aiSummaryCache.size);

        res.json({ summary, fromCache: false }); 
    } catch (error) {
        console.error('AI Summary Error', error.message);
        
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            console.error('RATE LIMIT HIT - Consider upgrading or adding delays');
        }
        const { issueDescription } = req.body; // Destructure here for fallback
        const fallback = issueDescription?.trim() || 'Failed to generate summary.';
        res.status(500).json({
            summary: fallback.length > 200 
                ? fallback.substring(0, 200) + '...'
                : fallback
        });
    }
});

setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of aiSummaryCache.entries()) {
        if (now - value.timestamp > AI_CACHE_DURATION) {
            aiSummaryCache.delete(key);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} old AI summaries. Cache size: ${aiSummaryCache.size}`);
    }
}, 60 * 60 * 1000)

// Rate Limit Check Route
app.get('/api/github/rate-limit', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.github.com/rate_limit',
            { headers: githubHeaders }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Rate limit check error:', error);
        res.status(500).json({ error: 'Failed to check rate limit' });
    }
});

// Start the server and listen for requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GitHub Token: ${GITHUB_TOKEN ? '✅' : '❌'}`);
    console.log(`Groq API Key: ${process.env.GROQ_API_KEY ? '✅' : '❌'}`);
    console.log(`AI Summary Cache: 24 hour TTL`);
});