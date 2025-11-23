import React, { useState, useEffect } from "react";

const DailyChallenge = ({ onChallengeSelect }) => {
    // State for Daily Challenges
    const [dailyIssue, setDailyIssue] = useState(null);
    const [loading, setLoading] = useState(false);

    // UseEffect: Runs code when component mounts
    useEffect(() => {
        // Generate a daily challenge based on the current date
        const today = new Date().toISOString().split('T')[0]; // e.g., "2023-10-05"
        const storedChallenge = localStorage.getItem(`dailyChallenge_${today}`);

        if (storedChallenge) {
            // Use previously stored challenge for today
            setDailyIssue(JSON.parse(storedChallenge));
        } else {
            // Generate a new challenge for today
            generateDailyChallenge();
        }
    }, []);

    // Generate a new Daily Challenge
    const generateDailyChallenge = async () => {
        setLoading(true);
        try {
            // For now, we'll use a mock challenge (will connect to API later)
            const mockChallenge = {
                id: Math.floor(Math.random() * 10000), // Random ID
                title: "Improve documentation for a popular open-source project",
                repo: "facebook/react",
                description: "Help enhance the documentation of the React project to make it more beginner-friendly.",
                difficulty: "Easy"
            };

            const today = new Date().toISOString().split('T')[0];
            // Stor challenge in localStorage so it persists for the day
            localStorage.setItem(`dailyChallenge_${today}`, JSON.stringify(mockChallenge));
            setDailyIssue(mockChallenge);
        } catch (error) {
            console.error('Error generating daily challenge:', error);
        } finally {
            setLoading(false); //Hide Loading state
        }
    };

    // Show loading state while fetching/generating challenge
    if (loading) {
        return <div className="daily-challenge">Loading Today's Challenge...</div>
    }

    return (
        <div className="daily-challenge">
            <h3>Today's Challenge</h3>
            {dailyIssue && ( // Only show if dailyIssue exists
                <div>
                    <h4>{dailyIssue.title}</h4>
                    <p>{dailyIssue.description}</p>
                    <p><strong>Repository:</strong> {dailyIssue.repo}</p>
                    <p><strong>Difficulty:</strong> {dailyIssue.difficulty}</p>
                    <button onClick={() => onChallengeSelect(dailyIssue)} className="challenge-btn">Try This Challenge</button>
                </div>
            )}
        </div>
    );
};

export default DailyChallenge;