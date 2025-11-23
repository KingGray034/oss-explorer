// Service function to fetch issues from GitHub
const fetchGitHubIssues = async (language, issueType, dateFilter = null) => {
    // Build search query string
    let queryTerms = []; // Use an array to build terms

    // Add language to query if specified
    if (language) {
        queryTerms.push(`language:${language}`);
    }

    // Add issue type to query based on selection
    if (issueType === 'good-first-issue') {
        queryTerms.push('label:"good first issue"');
    } else if (issueType === 'help-wanted') {
        queryTerms.push('label:"help wanted"');
    } else if (issueType === 'bug') {
        queryTerms.push('type:issue+label:bug');
    } else if (issueType === 'enhancement') {
        queryTerms.push('type:issue+label:enhancement');
    } else {
        queryTerms.push('type:issue');
    }

    // Add date filter if specified (e.g., issues created in the last month)
    if (dateFilter) {
        const now = new Date();
        let dateStr;

        switch(dateFilter) {
            case '24h':
                dateStr = new Date(now.getTime() - 24*60*60*1000).toISOString().split('T')[0];
                queryTerms.push(`created:>=${dateStr}`);
                break;
            case '7d':
                dateStr = new Date(now.getTime() - 7*24*60*60*1000).toISOString().split('T')[0];
                queryTerms.push(`created:>=${dateStr}`);
                break;
            case '30d':
                dateStr = new Date(now.getTime() - 30*24*60*60*1000).toISOString().split('T')[0];
                queryTerms.push(`created:>=${dateStr}`);
                break;
            case '90d':
                dateStr = new Date(now.getTime() - 90*24*60*60*1000).toISOString().split('T')[0];
                queryTerms.push(`created:>=${dateStr}`);
                break;
            default:
                break;
        }
    }

    // Add state:open to filter out closed issues
    queryTerms.push('state:open');

    // Join all terms with '+'
    const query = queryTerms.join('+');

    // Make request to GitHub API through our backend proxy
    const response = await fetch(
        `http://localhost:5000/api/github/search?q=${encodeURIComponent(query)}`
    );

    // Check if request was successful
    if (!response.ok) {
        console.error('GitHub API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch issues from GitHub. Status: ${response.status}`);
    }

    // Return the JSON response
    return response.json();
};

// Function to fetch repository files (README, CONTRIBUTING)
const fetchRepoFiles = async (owner, repo) => {
    try {
        // Get README file
        const readmeResponse = await fetch(
            `http://localhost:5000/api/github/repo-files/${owner}/${repo}/readme`
        );

        if (!readmeResponse.ok) {
           return { readme: '', contributing: '' };
        }

        const readmeData = await readmeResponse.json();

        // Pre-process README content - extract key sections
        let processedReadme = '';

        if (readmeData.readme && typeof readmeData.readme === 'string') {
            const sections = [
                { name: 'Description', regex: /##\s*Description\s*\n([\s\S]*?)(?=\n##|\n\n|$)/i },
                { name: 'Getting Started', regex: /##\s*Getting Started\s*\n([\s\S]*?)(?=\n##|\n\n|$)/i },
                { name: 'Installation', regex: /##\s*Installation\s*\n([\s\S]*?)(?=\n##|\n\n|$)/i },
                { name: 'Usage', regex: /##\s*Usage\s*\n([\s\S]*?)(?=\n##|\n\n|$)/i },
                { name: 'Contributing', regex: /##\s*Contributing\s*\n([\s\S]*?)(?=\n##|\n\n|$)/i }
            ];

            // Try to extract each section
            for (const section of sections) {
                const match = readmeData.readme.match(section.regex);
                if (match && match[1]) {
                    // Add section title and content
                    processedReadme += `## ${section.name}\n${match[1].trim()}\n\n`;
                }
            }

            // If no sections found. use first 500 characters
            if (!processedReadme) {
                processedReadme = readmeData.readme.substring(0, 500) + '...';
            }
        }

        return {
            readme: processedReadme,
            contributing: ''
        }
    } catch (error) {
        console.error('Error fetching repo files:', error);
        return { readme: '', contributing: '' };
    }
};

// Get AI processed issue description
const getAISummary = async (issueDescription, readmeContent, repoName) => {
    try {
        // Create a more focused prompt for the AI
        const prompt = `
            You are an expert at helping developers understand GitHub issues.

            Issue Description:
            ${issueDescription}

            Repositoty Information: ${repoName}

            Relevant Repository Documentation;
            ${readmeContent}

            Please provide a concise, beginner-friendly summary that explains:
            1. What needs to be done (the core task)
            2. Why it's needed (the purpose/impact)
            3. Any specific requirements or guidlines mentioned

            Format your reponse as follows: 
            - Start with a clear, simple sentence about what needs to be done
            - Follow with 2-3 bullet points explaining the context and requirements
            - Keep the total summary under 150 words
            - Use simple language that a beginner would understand
            - Focus on the most important information
        `;

        const response = await fetch('http://localhost:5000/api/ai/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                issueDescription,
                readmeContent,
                repoName,
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI summary');
        }

        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.error('AI Summary Error:', error); // Fixed typo: added semicolon
        // Fallback: Return a simplified version of the original description
        return issueDescription.length > 200 ? issueDescription.substring(0, 200) + '...' : issueDescription;
    }
};

export { fetchGitHubIssues, fetchRepoFiles, getAISummary };