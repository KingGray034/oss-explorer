import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchWidget = () => {
    const [language, setLanguage] = useState("");
    const navigate = useNavigate();

    const handleQuickSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (language) params.append('language', language);
        params.append('issueType', 'good-first-issue');

        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="search-widget">
            <h3 className="widget-title">🔎 Find Issues</h3>

            <form onSubmit={handleQuickSearch} className="quick-search-form">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="widget-select"
                >
                    <option value="">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="react">React</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                </select>

                <button type="submit" className="widget-search-btn">
                    Search Good First Issues
                </button>
            </form>

            <div className="quick-filters">
                <button 
                    className="filter-chip"
                    onClick={() => navigate('/search?issueType=good-first-issue')}
                >
                    ⭐ Good First Issue
                </button>
                <button 
                    className="filter-chip"
                    onClick={() => navigate('/search?issueType=help-wanted')}
                >
                    🆘 Help Wanted
                </button>
                <button 
                    className="filter-chip"
                    onClick={() => navigate('/search?issueType=bug')}
                >
                    🐛 Bugs
                </button>
            </div>

            <button 
                className="advanced-search-link"
                onClick={() => navigate('/search')}
            >
                Advanced Search →
            </button>
        </div>
    );
};

export default SearchWidget;