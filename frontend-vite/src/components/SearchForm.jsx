import { useState} from "react";

const SearchForm = ({ onSearch, initialData = {} }) => {
    const  [formData, setFormData] = useState({
        language: initialData.language || '',
        issueType: initialData.issueType || 'good-first-issue',
        dateFilter: initialData.dateFilter || ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name] : e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(formData);
    };

    const handleClear = () => {
        const clearedData = {
            language: '',
            issueType: '',
            dateFilter: ''
        };
        setFormData(clearedData);
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-form-grid">
                <div className="form-group">
                    <label htmlFor="language">Programming Language</label>
                    <select 
                        name="language" 
                        id="language" 
                        value={formData.language}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">All Languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="rust">Rust</option>
                        <option value="go">Go</option>
                        <option value="ruby">Ruby</option>
                        <option value="php">PHP</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="issueType">Issue Type</label>
                    <select 
                        name="issueType" 
                        id="issueType"
                        value={formData.issueType}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">All Types</option>
                        <option value="good-first-issue">Good First Issue</option>
                        <option value="help-wanted">Help Wanted</option>
                        <option value="bug">Bug</option>
                        <option value="enhancement">Enhancement</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="dateFilter">Posted Date</label>
                    <select 
                        name="dateFilter" 
                        id="dateFilter" 
                        value={formData.dateFilter}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">Any Time</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <div className="search-form-actions">
                <button type="button" onClick={handleClear} className="clear-btn">
                    Clear Filters
                </button>
                <button type="submit" className="search-submit-btn">
                    Search Issues
                </button>
            </div>
        </form>
    );
};

export default SearchForm;