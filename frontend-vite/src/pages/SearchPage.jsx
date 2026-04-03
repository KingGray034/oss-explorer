import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import SearchForm from "../components/SearchForm";
import IssueCard from "../components/IssueCard";

const SearchPage = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchParams] = useSearchParams();

    // To extract initial search parameters from the URL
    const initialLanguage = searchParams.get('language') || '';
    const initialIssueType = searchParams.get('issueType') || '';
    const initialDateFilter = searchParams.get('dateFilter') || '';

    const initialFormData = {
        language: initialLanguage,
        issueType: initialIssueType,
        dateFilter: initialDateFilter
    };

    const handleSearch = async (searchData) => {
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const { fetchGitHubIssues } = await import('../services/github');
            const data = await fetchGitHubIssues(
                searchData.language, 
                searchData.issueType || 'good-first-issue', 
                searchData.dateFilter
            );
            setIssues(data.items || []);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Effect to trigger search on initial load if there are URL params
    useEffect(() => {
        const hasParams = initialLanguage || initialIssueType || initialDateFilter;

        if (hasParams) {
            handleSearch(initialFormData);
        }
    }, []);

    return (
        <div className="search-page">
            <Header />
            <main className="main-content">
                <div className="search-page-header">
                    <h1 className="search-title">🔎 Discover Open Source Issues</h1>
                    <p className="search-subtitle">
                        Find the perfect issue to contribute to based on your skill and interests
                    </p>
                </div>

                <SearchForm onSearch={handleSearch} initialData={initialFormData} />

                {loading && (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Searching GitHub for issues...</p>
                    </div>
                )}

                {error && (
                    <div className="error">
                        <p>❌ Error: {error}</p>
                    </div>
                )}

                {/* Results or Empty State */}
                {!loading && hasSearched && (
                    <>
                        {issues.length > 0 ? (
                            <>
                                <div className="results-header">
                                    <h2>Found {issues.length} issues</h2>
                                </div>
                                <div className="issues-container">
                                    {issues.map(issue => (
                                        <IssueCard
                                            key={issue.id}
                                            issue={issue}
                                            showProgressTracker={false}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="no-results">
                                <div className="no-results-icon">🔎</div>
                                <h3>No issues found</h3>
                                <p>Try adjusting your search filters</p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state when no search is performed */}
                {!hasSearched && !loading && (
                    <div className="search-empty-state">
                        <div className="empty-state-icon">🚀</div>
                        <h3>Start Your Open Source Journey</h3>
                        <p>Select your preferences above and click "Search Issue" to find opportunities</p>
                        <div className="quick-tips">
                            <h4>Quick Tips:</h4>
                            <ul>
                                <li>Start with "Good First Issue" if you're new</li>
                                <li>Choose a language you're comfortable with</li>
                                <li>Check recent issues for active projects</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;