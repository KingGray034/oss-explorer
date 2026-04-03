const API_BASE_URL = 'http://localhost:5000/api';

class AIQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.requestsPerMinute = 25;
        this.delayBetweenRequests = 60000 / this.requestsPerMinute;
    }

    async addToQueue(issueDescription, readmeContent, repoName, issueUrl, callback) {
        this.queue.push({
            issueDescription,
            readmeContent,
            repoName,
            issueUrl,
            callback
        });

        if (!this.processing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length == 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const item = this.queue.shift();

        try {
            const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issueDescription: item.issueDescription,
                    readmeContent: item.readmeContent,
                    repoName: item.repoName,
                    issueUrl: item.issueUrl
                })
            });

            const data = await response.json();
            item.callback(data.summary, null);
        } catch (error) {
            console.error('AI Summary Error:', error);
            item.callback(
                item.issueDescription?.substring(0, 200) + '...',
                error
            );
        }

        setTimeout(() => this.processQueue(), this.delayBetweenRequests);
    }

    clearQueue() {
        this.queue = [];
        this.processing = false;
    }
}

export const aiQueue = new AIQueue();

export const fetchRepoFiles = async (owner, repo) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/github/repo-files/${owner}/${repo}/readme`
        );
        const data = await response.json();
        return {
            readme: data.readme || '',
            contributing: data.contributing || ''
        };
    } catch (error) {
        console.error('Error fetching repo files:', error);
        return { readme: '', contributing: '' };
    }
};


export const getAISummaryDirect = async (issueDescription, readmeContent, repoName, issueUrl) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issueDescription,
                readmeContent,
                repoName,
                issueUrl
            })
        });

        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.error('Error getting AI summary:', error);
        return issueDescription?.substring(0, 200) + '...' || 'Failed to get summary';
    }
};