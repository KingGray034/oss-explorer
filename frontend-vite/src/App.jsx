import { useState } from "react";
import SearchForm from "./components/SearchForm";
import IssueCard from "./components/IssueCard";
import DailyChallenge from "./components/DailyChallenge";
import UserProfile from "./components/UserProfile";
import './App.css';

function App() {
  // State for issues and loading status
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Handle search form submission
  const handleSearch = async (searchData) => {
    setLoading(true);
    try {
      // Import function from services/github.js
      const { fetchGitHubIssues } = await import('./services/github'); 

      // Call service function with all search parameters
      const data = await fetchGitHubIssues(
        searchData.language,
        searchData.issueType,
        searchData.dateFilter
      );

      setIssues(data.items || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Progress status changes (placeholder)
  const handleStatusChange = (issueId, newStatus) => {
    console.log(`Issue ${issueId} status changed to ${newStatus}`);
    // This will be connected to user profile/localStorage system later
  };

  // Handle daily challenge selection
  const handleDailyChallenge = (challenge) => {
    alert(`Daily Challenge: ${challenge.title}`);
  };

  return (
    <div className="App">
      {/* Profile Toggle Button - Added to header section */}
      <div className="app-header">
          <h1>Open Source Explorer</h1>
          <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
              {showProfile ? 'Back to Search' : 'My Profile'} {/* Toggle text */}
          </button>
      </div>

      {showProfile ? (
        // Show Profile View
        <UserProfile />
      ) : (
        // Original Search View 
        <>
            {/* Header Section - Kept search view */}
            <header className="App-header">
                <h1>Open Source Explorer</h1>
                <p>Find your next open source contribution</p>
            </header>

            <main>
                <DailyChallenge onChallengeSelect={handleDailyChallenge} />
                <SearchForm onSearch={handleSearch} />

                {loading && <div className="loading">Searching GitHub for issues...</div>}

                <div className="issues-container">
                  {issues.map(issue => (
                    <IssueCard key={issues.id} issue={issue} onStatusChange={handleStatusChange} />
                  ))}
                </div>
            </main>
        </>
      )}
    </div>
  );
}

export default App;