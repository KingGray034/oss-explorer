import { useState, useEffect } from "react";


const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('history'); // 'History', 'Solved' etc.

    // Mock user data (will be replaced with real data fetching)
    const mockUserData = {
        username: 'john_doe',
        avatar: '/images/default-avatar.png',
        contributions: 25,
        solvedIssues: [
            {
                id: 1,
                title: 'Fix login authentication bug',
                repo: 'facebook/react',
                status: 'completed',
                solvedAt: '2024-01-15',
                progressHistory: [
                    { status: 'in-progress', timestamp: '2024-01-10' },
                    { status: 'pull-request', timestamp: '2024-01-12' },
                    { status: 'completed', timestamp: '2024-01-15' }
                ]
            },
            {
                id: 2,
                title: 'Add dark mode toggle feature',
                repo: 'microsoft/vscode',
                status: 'in-progress',
                solvedAt: null,
                progressHistory: [
                    { status: 'in-progress', timestamp: '2024-01-17' }
                ]
            }
        ],
        history: [
            {
                id: 3,
                title: 'Update documentation for API usage',
                repo: 'google/material-ui',
                viewedAt: '2024-01-20',
                status: 'viewed'
            }
        ]
    };


    useEffect(() => {
        setUser(mockUserData);
    }, []);


    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-500';
            case 'pull-request': return 'bg-yellow-500';
            case 'in-progress': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'completed': return 'Completed';
            case 'pull-request': return 'Pull Request Created';
            case 'in-progress': return 'In Progress';
            default: return 'Unknown';
        }
    };

    return (
        <div className="user-profile">
            <div className="profile-header">
                <img src={user?.avatar} alt="User Avatar" className="avatar" />
                <div className="profile-info">
                    <h2>{user?.username}</h2>
                    <p>Contributions: {user?.contributions}</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={activeTab === 'history' ? 'active-tab' : 'tab'}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
                <button
                    className={activeTab === 'solved' ? 'active-tab' : 'tab'}
                    onClick={() => setActiveTab('solved')}
                >
                    Solved Issues
                </button>
                <button
                    className={activeTab === 'progress' ? 'active-tab' : 'tab'}
                    onClick={() => setActiveTab('progress')}
                >
                    In Progress
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'history' && (
                    <div className="history-section">
                        <h3>Recently Viewed Issues</h3>
                        {user?.history.map(issue => (
                            <div key={issue.id} className="history-item">
                                <h4>{issue.title}</h4>
                                <p>{issue.repo}</p>
                                <p>Viewed: {issue.viewedAt}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'solved' && (
                    <div className="solved-section">
                        <h3>Solved Issues</h3>
                        {user?.solvedIssues.filter(issue => issue.status === 'completed').map(issue => (
                            <div key={issue.id} className="solved-item">
                                <h4>{issue.title}</h4>
                                <p>{issue.repo}</p>
                                <p>Solved: {issue.solvedAt}</p>
                                <div className="status-badge">
                                    <span className={`status-dot ${getStatusColor(issue.status)}`}></span>
                                    {getStatusText(issue.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="progress-section">
                        <h3>In Progress Issues</h3>
                        {user?.solvedIssues.filter(issue => issue.status !== 'completed').map(issue => (
                            <div key={issue.id} className="progress-item">
                                <h4>{issue.title}</h4>
                                <p>{issue.repo}</p>
                                <div className="status-badge">
                                    <span className={`status-dot ${getStatusColor(issue.status)}`}></span>
                                    {getStatusText(issue.status)}
                                </div>
                                <ProgressBar status={issue.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ProgressBar Component
const ProgressBar = ({ status }) => {
    const progressMap = {
        'in-progress': 33,
        'pull-request': 66,
        'completed': 100
    };

    const progress = progressMap[status] || 0;

    return (
        <div className="progress-container">
            <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
            />
            <span className="progress-label">{status}</span>
        </div>
    );
};

export default UserProfile;