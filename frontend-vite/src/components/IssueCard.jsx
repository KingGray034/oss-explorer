import { useEffect, useState, useRef } from "react";
import { fetchRepoFiles, getAISummaryDirect } from "../services/aiQueue";
import ProgressTracker from "./ProgressTracker";


const IssueCard = ({ issue, showProgressTracker = false, initialStatus = 'not-started', onStatusChange, onUnsave }) => {
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const cardRef = useRef(null);

    const {
        title,
        body,
        html_url,
        repository_url,
        created_at,
        user,
        labels
    } = issue;

    const repoParts = repository_url.split('/');
    const owner = repoParts[repoParts.length - 2];
    const repo = repoParts[repoParts.length - 1];
    const repoName = `${owner}/${repo}`;

    // Check if issue is already saved on mount 
    useEffect(() => {
        const savedIssues = JSON.parse(localStorage.getItem('savedIssues') || '[]');
        const isAlreadySaved = savedIssues.some(saved => saved.id === issue.id);
        setIsSaved(isAlreadySaved);
    }, [issue.id]);

    // Detect when card is visible in viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Only fetch AI summary when card becomes visible
    useEffect(() => {
        if (!isVisible) return;

        const loadRepoData = async () => {
            setLoadingSummary(true);
            try {
                const files = await fetchRepoFiles(owner, repo);

                const summary = await getAISummaryDirect(
                    body || title,
                    files.readme,
                    repoName,
                    html_url
                );
                setAiSummary(summary);
            } catch (error) {
                console.error('Error Loading repo data:', error);
                const fallbackText = body || title;
                setAiSummary(
                    fallbackText.length > 200
                        ? fallbackText.substring(0, 200) + '...'
                        : fallbackText
                );
            } finally {
                setLoadingSummary(false);
            }
        };
        if (owner && repo && (body || title)) {
            loadRepoData();
        }
    }, [isVisible, owner, repo, body, title, repoName, html_url]);

    const handleSave = () => {
        const savedIssues = JSON.parse(localStorage.getItem('savedIssues') || '[]');
        if (isSaved) {
            // Unsave
            const updated = savedIssues.filter(saved => saved.id !== issue.id);
            localStorage.setItem('savedIssues', JSON.stringify(updated));
            
            // Remove from statuses
            const statuses = JSON.parse(localStorage.getItem('issueStatuses') || '{}');
            delete statuses[issue.id];
            localStorage.setItem('issueStatuses', JSON.stringify(statuses));
            setIsSaved(false);
            console.log('Unsaved issue:', issue.id);

            // Notify parent if this is being called from profile
            if (onUnsave) {
                onUnsave(issue.id)
            }
        } else {
            // Save the issue
            const issueToSave = {
                id: issue.id,
                title,
                body,
                html_url,
                repository_url,
                created_at,
                user,
                labels
            };
            
            savedIssues.push(issueToSave);
            localStorage.setItem('savedIssues', JSON.stringify(savedIssues));

            //  Initialize status as 'not-started'
            const statuses = JSON.parse(localStorage.getItem('issueStatuses') || '{}');
            statuses[issue.id] = 'not-started';
            localStorage.setItem('issueStatuses', JSON.stringify(statuses));
            setIsSaved(true);
            console.log('Saved issue:', issue.id);
        }
    };

    return (
        <div className="issue-card" ref={cardRef}>
            <h3 className="issue-title">{title}</h3>
            <p className="repo-name">📦 {repoName}</p>

            <div className="ai-summary-section">
                {loadingSummary ? (
                    <div className="loading-summary">
                        <span className="loading-dots">Analyzing issue</span>
                    </div>
                ) : (
                    <div className="ai-summary">{aiSummary}</div>
                )}
            </div>
            
            {/* Issue Metadata */}
            <div className="issue-meta">
                <span className="meta-creator">👤 {user.login}</span>
                <span className="meta-date">📅 {new Date(created_at).toLocaleDateString()}</span>
            </div>

            {/* Issue Labels */}
            {labels && labels.length > 0 && (
                <div className="labels-container">
                    {labels.slice(0, 3).map(label => (
                        <span 
                            key={label.id}
                            className="label-badge"
                            style={{ backgroundColor: `#${label.color}` }}
                        >
                            {label.name}
                        </span>
                    ))}
                    {labels.length > 3 && (
                        <span className="label-badge label-more">
                            +{labels.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Progress Tracking */}
            {showProgressTracker && (
                <ProgressTracker
                    initialStatus = {initialStatus}
                    onStatusChange={(newStatus) => {
                        if (onStatusChange) {
                            onStatusChange(newStatus);
                        }
                    }}
                />
            )}

            {/* Action Buttons */}
            <div className="issue-actions">
                <a
                    href={html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-issue-link"
                >
                    View on GitHub
                </a>
                <button 
                    className={`save-issue-btn ${isSaved ? 'saved' : ''}`}
                    onClick={handleSave}
                >
                    {isSaved ? 'Saved': 'Save'}
                </button>
            </div>
        </div>
    );
};

export default IssueCard;