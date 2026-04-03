import { useState, useEffect } from "react";

const DailyChallenge = () => {
    const [dailyIssue, setDailyIssue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streak, setStreak] = useState(0); 

    useEffect(() => {
        const fetchDailyChallenge = async () => {
            setLoading(true);
            setError(null);

            try {
                // To generate a unique key based the days date, to ensure the same issue is fetched for the entire day
                const today = new Date().toISOString().split('T')[0];
                const cacheKey = `dailyChallenge_${today}`;


                // Check if we have a cached issue for today
                const cachedChallenge = localStorage.getItem(cacheKey);
                if (cachedChallenge) {
                    setDailyIssue(JSON.parse(cachedChallenge));
                    setLoading(false);
                    return;
                }

                // Get user skill
                const userSkill = localStorage.getItem('userSkill') || 'Beginner';

                //If not cached, fetch fresh from backend
                const response = await fetch(
                    `http://localhost:5000/api/daily-challenge?skill=${userSkill}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                console.log('📦 Received data:', data)

                if (data && data.title && data.html_url) {
                    setDailyIssue(data);
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } else {
                    setDailyIssue({
                         title: 'No challenges available today!', 
                         body: 'Check back tomorrow for a new issue.', 
                         html_url: '#',
                         difficulty: 'Unknown' 
                    });
                }
            } catch (err) {
                console.error('Error fetching daily challenge:', err);
                setError(err.message);
                // Fallback to a default message
                setDailyIssue({ title: 'Error fetching challenge', body: 'Please try again later.', html_url: '#' });
            } finally {
                setLoading(false);
            }
        };


        fetchDailyChallenge();
    }, []);

    useEffect(() => {
        const loadStreak = () => {
            const savedStreak = localStorage.getItem('userStreak');
            if (savedStreak) {
                setStreak(parseInt(savedStreak));
            }
        };
        loadStreak();
    }, [])

    if (error) {
        return <div className="daily-challenge error">Error: {error}</div>
    }

    if (loading) {
        return <div className="daily-challenge loading">Loading your daily challenge...</div>
    }

    // Just in case the dailyIssue is null for some reason
    if (!dailyIssue) {
        return <div className="daily-challenge">No Challenge Loaded.</div>;
    }


    // If dailyIssue exists, then we render it
    return (
        <div className="daily-challenge">
            {/* Top */}
            <div className="challenge-header">
                <h3>🔥 Daily Challenge!</h3>
                <p className="streak-info">
                    {streak}-day streak • Complete today to keep it going!!
                </p>
            </div>

            {/* Inner */}
            <div className="challenge-details-box">
                <h4 className="challenge-title">
                    {dailyIssue.title}
                </h4>
                <p className="challenge-description">
                    {dailyIssue.body?.substring(0, 150)}...
                </p>

                {/* Repo and Difficulty Row */}
                <div className="challenge-meta">
                    <div className="meta-item">
                        <span className="meta-label">Repository:</span>
                        <span className="meta-value repo">
                            {dailyIssue.repository_url
                                ? dailyIssue.repository_url.split('/').slice(-2).join('/') : 'N/A'}
                        </span>
                    </div>

                    <div className="meta-item">
                        <span className="meta-label">Difficulty: </span>
                        <span className={`meta-value difficulty-${dailyIssue.difficulty?.toLowerCase()}`}>
                            {dailyIssue.difficulty || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                {dailyIssue.labels && dailyIssue.labels.length > 0 && (
                    <div className="challenge-tags">
                        {dailyIssue.labels.map((label, index) => (
                            <span 
                            key={index} 
                            className="challenge-tag" 
                            data-color={label.color}
                            style={{'--tag-color': `#${label.color}`}}
                            >
                                {label.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Start Button */}
            <a 
                href={dailyIssue.html_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="challenge-start-btn"
            >
                Start Challenge
            </a>
        </div>
    );
};


export default DailyChallenge;