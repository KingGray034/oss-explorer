import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const HamburgerMenu = ({ isOpen, onClose}) => {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        followers: 245,
        following: 180,
        solved: 0,
        saved: 0,
        inProgress: 0
    });

    // Load real stats from localStorage
    useEffect(() => {
        const savedIssues = JSON.parse(localStorage.getItem('savedIssues') || '[]');
        const statuses = JSON.parse(localStorage.getItem('issueStatuses') || '{}');

        const solvedCount = Object.values(statuses).filter(status => status === 'completed').length;
        const inProgressCount = Object.values(statuses).filter(status => status === 'in-progress' || status === 'pull-request').length;

        setStats(prev => ({
            ...prev,
            saved: savedIssues.length,
            solved: solvedCount,
            inProgress: inProgressCount
        }));
    }, [isOpen]); // Refresh when menu opens 

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('.hamburger-menu')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const goToProfile = (tab) => {
        navigate(`/profile?tab=${tab}`);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
            <div className="menu-header">
                <div className="user-info">
                    <img src="https://via.placeholder.com/60" alt="User Avatar" className="avatar-large" />
                    <div className="user-details">
                        <div className="username">John Doe</div> {/* Placeholder username */}
                        <div className="handle">@johndoe</div> {/* Placeholder handle */}
                    </div>
                </div>
            </div>

            <nav className="menu-nav">
                <Link to="/" className="menu-item" onClick={onclose}>
                    <i className="home-icon">🏠</i>
                    Home
                </Link>
                <Link to="/search" className="menu-item" onClick={onClose}>
                    <i className="search-icon">🔎</i>
                    Search Issues
                </Link>
                <Link to="/profile" className="menu-item" onClick={onClose}>
                    <i className="profile-icon">👤</i>
                    My Profile
                </Link>
                <Link to="/logout" className="menu-item logout" onClick={onClose}>
                    <i className="logout-icon">🚪</i>
                    Logout
                </Link>
            </nav>

            <div className="stats-section">
                <div className="stat" onClick={() => goToProfile('followers')} style={{ cursor: 'pointer' }}>
                    <span className="stat-number">{stats.followers}</span>
                    <span className="stat-label">Followers</span>
                </div>
                <div className="stat" onClick={() => goToProfile('following')} style={{ cursor: 'pointer' }}>
                    <span className="stat-number">{stats.following}</span>
                    <span className="stat-label">Following</span>
                </div>
                <div className="stat" onClick={() => goToProfile('solved')} style={{ cursor: 'pointer' }}>
                    <span className="stat-number">{stats.solved}</span>
                    <span className="stat-label">Solved</span>
                </div>
            </div>
        </div>
    );
};

export default HamburgerMenu;