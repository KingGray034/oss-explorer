const fetchGitHubIssues = async (language, issueType, dateFilter = null) => {
    let queryTerms = [];

    if (language) {
        queryTerms.push(`language:${language}`);
    }

    if (issueType === 'good-first-issue') {
        queryTerms.push('label:"good first issue"');
    } else if (issueType === 'help-wanted') {
        queryTerms.push('label:"help wanted"');
    } else if (issueType === 'bug') {
        queryTerms.push('type:issue+label:bug');
    } else if (issueType === 'enhancement') {
        queryTerms.push('type:issue+label:enhancement');
    } else if (issueType === 'all') {
        queryTerms.push('type:issue'); 
    } else {
        queryTerms.push(`label:"${issueType}"`); 
    }

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

    queryTerms.push('state:open');

    const query = queryTerms.join('+');

    const response = await fetch(
        `http://localhost:5000/api/github/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        console.error('GitHub API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch issues from GitHub. Status: ${response.status}`);
    }

    return response.json();
};

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
        return readmeData;
    } catch (error) {
        console.error('Error fetching repo files:', error);
        return { readme: '', contributing: '' };
    }
};

const getAISummary = async (issueDescription, readmeContent, repoName) => {
    try {
        const prompt = `
            You are an expert at helping developers understand GitHub issues.

            Issue Description:
            ${issueDescription}

            Repository Information: ${repoName}

            Relevant Repository Documentation;
            ${readmeContent}

            Please provide a concise, beginner-friendly summary that explains:
            1. What needs to be done (the core task)
            2. Why it's needed (the purpose/impact)
            3. Any specific requirements or guidelines mentioned

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
        console.error('AI Summary Error:', error);
        return issueDescription.length > 200 ? issueDescription.substring(0, 200) + '...' : issueDescription;
    }
};

export { fetchGitHubIssues, fetchRepoFiles, getAISummary }; 