import { useEffect, useState } from "react";
import { fetchRepoFiles, getAISummary } from "../services/github";
import ProgressTracker from "./ProgressTracker";


const IssueCard = ({ issue, onStatusChange }) => {
    // State for AI summary and loading
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [repoFiles, setRepoFiles] = useState({ readme: '', contributing: '' });

    const {
        title,
        body,
        html_url,
        repository_url,
        created_at,
        user,
        labels
    } = issue;

    // Extract repository owner and name from URL
    const repoParts = repository_url.split('/');
    const owner = repoParts[repoParts.length - 2];
    const repo = repoParts[repoParts.length - 1];

    // Fetch repository files and get AI summary
    useEffect(() => {
        const loadRepoData = async () => {
            setLoadingSummary(true);
            try {
                // Fetch README content 
                const files = await fetchRepoFiles(owner, repo);
                setRepoFiles(files);

                // Get AI summary
                const summary = await getAISummary(body || title, files.readme, repo);
                setAiSummary(summary);
            } catch (error) {
                console.error('Error loading repo ', error);
                setAiSummary(body || title); // Fallback to original body
            } finally {
                setLoadingSummary(false);
            }
        };

        if (body || repo) { //Only load if we have data
            loadRepoData();
        }
    }, [owner, repo, body, title]);

    const truncateText = (text, maxLength = 200) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const repoName = repository_url.split('/').slice(-2).join('/');


    return (
        <div className="issue-card">
            {/* Issue Title */}
            <h3 className="issue-title">{title}</h3>
            <p className="repo-name">{repoName}</p>

            {/* AI Summary Section */}
            <div className="ai-summary-section">
                {loadingSummary ? (
                    <p className="loading-summary">Analyzing issue...</p>
                ) : (
                    <p  className="ai-summary">{truncateText(aiSummary, 200)}</p>
                )}
            </div>

            {/* Issue Metadata */}
            <div className="issue-meta">
                <span className="meta-creator">👤 {user.login}</span>
                <span className="meta-date">📅 {new Date(created_at).toLocaleDateString()}</span>
            </div>

            {/* Issue Labels */}
            <div className="labels-container">
                {labels.slice(0, 3).map(label =>(
                    <span key={label.id} className="label-badge" style={{ background: `#${label.color}` }}>
                        {label.name}
                    </span>
                ))}
            </div>

            {/* Progress Tracking */}
            <ProgressTracker
                issue={{ status: 'not-started' }} // Default status
                onStatusChange={(newStatus) => onStatusChange(issue.id, newStatus)}
            />

            {/* Link to GitHub Issue */}
            <a href={html_url} target="_blank" rel="noopener noreferrer" className="view-issue-link">
                View Issue on GitHub
            </a>
        </div>
    );
};

export default IssueCard;