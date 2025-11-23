import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { InferenceClient } from '@huggingface/inference';

const app = express();
const PORT = process.env.PORT || 5000;

const hf = new InferenceClient({
    apiKey: process.env.HUGGING_FACE_OSS_01_API_KEY
});

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.get('/api/github/search', async (req, res) => {
    // Extract query parameters from the url
    // Example: /api/github/search?q=javascript&sort=updated&per_page=20
    try {
        const { q, sort = 'updated', order = 'desc', per_page = 20 } = req.query;

        // Build the query string for GitHub API
        const queryString = `q=${q}&sort=${sort}&order=${order}&per_page=${per_page}`;

        // Make a request to GitHub API
        const response = await fetch(
            `https://api.github.com/search/issues?${queryString}`
        );

        // Check if GitHub API responded successfully
        if (!response.ok) {
            throw new Error(`Github API error: ${response.status}`);
        }

        // Convert response to JSON and send back to frontend
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // Handle errors
        console.error('GitHub API error:', error);
        res.status(500).json({ error: 'Failed to fetch from GitHub API' });
    }
});

// New Route to fetch repo files (README, CONTRIBUTING)
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
            `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`
        );

        if (!response.ok) {
            // Try lowercase versions
            const lowercaseResponse = await fetch (
                `https://api.github.com/repos/${owner}/${repo}/contents/${fileName.toLocaleLowerCase()}`
            );

            if (!lowercaseResponse.ok) {
                return res.json({ content: '' });
            }

            const data = await lowercaseResponse.json();
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            res.json({ content });
        } else {
            const data = await response.json();
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            res.json({ content });
        }
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
                    `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');
                    return res.json({ readme: content, contributing: '' });
                }
            } catch (err) {
                continue; //Try next filename
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
        const { issueDescription, readmeContent, repoName } = req.body;

        // Construct the text to summarize
        const textToSummarize = `Issue: ${issueDescription}\n\nRepo Info: ${repoName}\n\nRelevant Doc: ${readmeContent}`;

        // Use a summarization model
        const result = await hf.summarization({
            model: 'facebook/bart-large-cnn', // Or 'google/pegasus-xsum'
            inputs: textToSummarize,
            parameters: {
                max_length: 100, // Maximum length of the summary
                min_length: 30,  // Minimum length of the summary
            }
        });

        // The result object from summarization has a 'summary_text' property
        res.json({ summary: result.summary_text });
    } catch (error) {
        console.error('AI Summary Error (Summarization Model):', error);
        const { issueDescription } = req.body; // Destructure here for fallback
        res.status(500).json({
            summary: issueDescription && issueDescription.length > 200 ? issueDescription.substring(0, 200) + '...' : (issueDescription || 'Failed to generate summary.')
        });
    }
});

// Daily Challenge Route: Gets a random "good first issue"
app.get('/api/daily-challenge', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.github.com/search/issues?q=label:"good first issue"&sort=updated&order=desc&per_page=1'
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Daily Challenge error:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge' });
    }
});

// Start the server and listen for requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});