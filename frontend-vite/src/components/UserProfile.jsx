import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import IssueCard from "./IssueCard";

const UserProfile = ({ userData }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize user state with provided data or default mock data
    const [user, setUser] = useState(userData || {
        username: 'johndoe',
        avatar: 'https://via.placeholder.com/100',
        bio: 'Open source enthusiast. Love contributing to projects and helping others.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        joined: 'January 2020',
        stats: {
            followers: 120,
            following: 80,
            solved: 45
        },
        recentActivity: [
            {
                type: 'solved',
                issue: 'Fix login authentication bug',
                repo: 'facebook/react',
                date: '2 days ago'
            },
            {
                type: 'commented',
                issue: 'Add dark mode feature',
                repo: 'vuejs/vue',
                date: '1 week ago'
            }
        ]
    });

    const initialTab = searchParams.get('tab') || 'saved';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [savedIssues, setSavedIssues] = useState([]);
    const [issueStatuses, setIssueStatuses] = useState({});

    // Update active tab when URL parameter changes
    useEffect(() => {
        const tabFromURL = searchParams.get('tab');
        if (tabFromURL) {
            setActiveTab(tabFromURL);
        }
    }, [searchParams]);
    
    // Load Saved Issues and statuses from LocalStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedIssues') || '[]');
        const statuses = JSON.parse(localStorage.getItem('issueStatuses') || '{}');
        setSavedIssues(saved);
        setIssueStatuses(statuses);
    }, []);

    // Update stats whenever saved issues or statuses change
    useEffect(() => {
        const solvedCount = Object.values(issueStatuses).filter(status => status === 'completed').length;
        setUser(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                solved: solvedCount
            }
        }));
    }, [issueStatuses]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSearchParams({ tab: tabName });
    };

    //Handler for when issue status changes from IssueCard component
    const handleStatusChange = (issueId, newStatus) => {
        const updatedStatuses = {
            ...issueStatuses,
            [issueId]: newStatus
        };
        setIssueStatuses(updatedStatuses)
        localStorage.setItem('issueStatuses', JSON.stringify(updatedStatuses));
        console.log(`Issue ${issueId} status changed to ${newStatus}`);
    };

    // Unsaving an Issue
    const handleUnsave = (issueId) => {
        const updated = savedIssues.filter(issue => issue.id !== issueId);
        setSavedIssues(updated);
        localStorage.setItem('savedIssues', JSON.stringify(updated));

        const updatedStatuses = { ...issueStatuses };
        delete updatedStatuses[issueId];
        setIssueStatuses(updatedStatuses);
        localStorage.setItem('issueStatuses', JSON.stringify(updatedStatuses));
    };

    // Filter issues by status
    const solvedIssues = savedIssues.filter(issue => 
        issueStatuses[issue.id] === 'completed'
    );

    const inProgressIssues = savedIssues.filter(issue =>
        issueStatuses[issue.id] === 'in-progress' ||
        issueStatuses[issue.id] === 'pull-request'
    );

    const notStartedIssues = savedIssues.filter(issue =>
        !issueStatuses[issue.id] ||
        issueStatuses[issue.id] === 'not-started'
    );

    return (
        <div className="user-profile">
            <div className="profile-header">
                <img src={user.avatar} alt={`${user.username}'s avatar`} className="avatar" />
                <div className="profile-info">
                    <h2>{user.username}</h2>
                    <p className="bio">{user.bio}</p>
                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">{user.stats.followers}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{user.stats.following}</span>
                            <span className="stat-label">Following</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{savedIssues.length}</span>
                            <span className="stat-label">Saved</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{user.stats.solved}</span>
                            <span className="stat-label">Solved</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{inProgressIssues.length}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('saved')}
                >
                    Saved Issues ({savedIssues.length})
                </button>
                <button
                    className={`tab ${activeTab === 'solved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('solved')}
                >
                    Solved ({solvedIssues.length})
                </button>
                <button
                    className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                    onClick={() => handleTabChange('in-progress')}
                >
                    In Progress ({inProgressIssues.length})
                </button>
                <button
                    className={`tab ${activeTab === 'not-started' ? 'active' : ''}`}
                    onClick={() => handleTabChange('not-started')}
                >
                    Not Started
                </button>
                <button
                    className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => handleTabChange('activity')}
                >
                    Activity
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => handleTabChange('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'saved' && (
                    <div className="saved-section">
                        {savedIssues.length === 0 ? (
                            <div className="empty-state-profile">
                                <div className="empty-icon">📑</div>
                                <h3>No Saved Issues Yet</h3>
                                <p>Start Saving Issues from the page to track your progress!</p>
                            </div>
                        ) : (
                            <div className="issues-container">
                                {savedIssues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        showProgressTracker={true}
                                        initialStatus={issueStatuses[issue.id] || 'not-started'}
                                        onStatusChange={(newStatus) => handleStatusChange(issue.id, newStatus)}
                                        onUnsave={handleUnsave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'solved' && (
                    <div className="solved-section">
                        {solvedIssues.length === 0 ? (
                            <div className="empty-state-profile">
                                <div className="empty-icon">✅</div>
                                <h3>No Solved Issues Yet</h3>
                                <p>Mark issues as complete to see them here!</p>
                            </div>
                        ) : (
                            <div className="issues-container">
                                {solvedIssues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        showProgressTracker={true}
                                        initialStatus={issueStatuses[issue.id]}
                                        onStatusChange={(newStatus) => handleStatusChange(issue.id, newStatus)}
                                        onUnsave={handleUnsave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'in-progress' && (
                    <div className="in-progress-section">
                        {inProgressIssues.length === 0 ? (
                            <div className="empty-state-profile">
                                <div className="empty-icon">🚀</div>
                                <h3>No Issues In Progress</h3>
                                <p>Start working on some issues!</p>
                            </div>
                        ) : (
                            <div className="issues-container">
                                {inProgressIssues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        showProgressTracker={true}
                                        initialStatus={issueStatuses[issue.id]}
                                        onStatusChange={(newStatus) => handleStatusChange(issue.id, newStatus)}
                                        onUnsave={handleUnsave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'not-started' && (
                    <div className="not-started-section">
                        {notStartedIssues.length === 0 ? (
                            <div className="empty-state-profile">
                                <div className="empty-icon">📑</div>
                                <h3>No Issues Waiting</h3>
                                <p>All your saved issues have been started!</p>
                            </div>
                        ) : (
                            <div className="issues-container">
                                {notStartedIssues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        showProgressTracker={true}
                                        initialStatus={issueStatuses[issue.id] || 'not-started'}
                                        onStatusChange={(newStatus) => handleStatusChange(issue.id, newStatus)}
                                        onUnsave={handleUnsave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="activity-section">
                        <h3>Recent Activity</h3>
                        {user.recentActivity && user.recentActivity.length > 0 ? (
                            <div className="activity-list">
                                {user.recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <span className="activity-type">
                                            {activity.type === 'solved' ? '✅' : '💬'}
                                        </span>
                                        <div className="activity-details">
                                            <p><strong>{activity.issue}</strong></p>
                                            <p className="activity-meta">
                                                {activity.repo} • {activity.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-profile">
                                <div className="empty-icon">📊</div>
                                <h3>No Recent Activity</h3>
                                <p>your activity will appear here as you interact with issues.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h3>Settings</h3>
                        <div className="settings-content">
                            <div className="setting-group">
                                <h4>Profile Information</h4>
                                <div className="setting-item">
                                    <label>Username</label>
                                    <input type="text" value={user.username} readOnly />
                                </div>
                                <div className="setting-item">
                                    <label>Bio</label>
                                    <textarea value={user.bio} readOnly rows="3" />
                                </div>
                                <div className="setting-item">
                                    <label>Location</label>
                                    <input type="text" value={user.location} readOnly />
                                </div>
                                <div className="setting-item">
                                    <label>Website</label>
                                    <input type="url" value={user.website} readOnly />
                                </div>
                            </div>

                            <div className="setting-group">
                                <h4>Preferences</h4>
                                <div className="setting-item">
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Show progress tracker on saved issues
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Show progress tracker on saved issues
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <input type="checkbox" />
                                        Public profile
                                    </label>
                                </div>
                            </div>

                            <div className="setting-group">
                                <h4>Data Management</h4>
                                <button className="danger-btn" onClick={() => {
                                    if (window.confirm('Are you sure? This will clear all the saved issues andf progress.')) {
                                        localStorage.removeItem('savedIssues');
                                        localStorage.removeItem('issueStatuses');
                                        setSavedIssues([]);
                                        setIssueStatuses({});
                                    }
                                }}>
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;