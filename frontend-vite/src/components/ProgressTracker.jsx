import { useState, useEffect } from "react";

const ProgressTracker = ({ initialStatus = 'not-started', onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(initialStatus);

    // Update local status when initialStatus prop changes
    useEffect(() => {
        setCurrentStatus(initialStatus);
    }, [initialStatus]);

    //List of statuses and color
    const statusOptions = [
        { value: 'not-started', label: 'Not Started', color: '#95a5a6' }, //Gray
        { value: 'in-progress', label: 'In Progress', color: '#3498db' }, //Blue
        { value: 'pull-request', label: 'Pull Request', color: '#f39c12' }, //Orange
        { value: 'completed', label: 'Completed', color: '#27ae60' } //Green
    ];

    const handleStatusChange = (newStatus) => {
        setCurrentStatus(newStatus);
        if (onStatusChange) {
            onStatusChange(newStatus);
        }
    };

    const calculateProgress = (status) => {
        switch(status) {
            case 'in-progress': return 33;
            case 'pull-request': return 66;
            case 'completed': return 100;
            default: return 0;
        }
    };

    const progressPercentage = calculateProgress(currentStatus);
    const currentStatusLabel = statusOptions.find(opt => opt.value === currentStatus)?.label || 'Not Started';

    return (
        <div className="progress-tracker">
            <h4>Track Progress</h4>
            <div className="status-selector">
                {statusOptions.map(option => (
                    <button 
                        key={option.value} 
                        className={`status-btn ${currentStatus === option.value ? 'active' : ''}`} 
                        onClick={() => handleStatusChange(option.value)} 
                        style={{ 
                            backgroundColor: currentStatus === option.value ? option.color : 'transparent', 
                            color: currentStatus === option.value ? '#fff' : option.color, 
                            border: `2px solid ${option.color}`
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="progress-container">
                <div 
                    className="progress-bar" 
                    style={{ 
                        width: `${progressPercentage}%`, 
                        backgroundColor: statusOptions.find(opt => opt.value === currentStatus)?.color || '#95a5a6' 
                    }} 
                />
                <span className="progress-label">{progressPercentage}% - {currentStatusLabel}</span>
            </div>
        </div>
    );
};

export default ProgressTracker;