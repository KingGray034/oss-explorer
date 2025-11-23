import React from "react";


const ProgressTracker = ({ issue, onStatusChange }) => {
    const statusOptions = [
        { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
        { value: 'pull-request', label: 'Pull Request Created', color: 'bg-yellow-500' },
        { value: 'completed', label: 'Completed', color: 'bg-green-500' }
    ];

    return (
        <div className="progress-tracker">
            <h4>Track Progress</h4>
            <div className="status-selector">
                {statusOptions.map(option => (
                    <button
                        key={option.value}
                        className={`status-btn ${issue.status === option.value ? 'active' : ''}`}
                        onClick={() => onStatusChange(option.value)}
                        style={{ backgroundColor: option.color.replace('bg-', '') }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <ProgressBar status={issue.status} />
        </div>
    );
};

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


export default ProgressTracker;