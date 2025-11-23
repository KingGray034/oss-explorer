import React, { useState } from "react";

const SearchForm = ({ onSearch}) => {
    const [formData, setFormData] = useState({
        language: '',
        issueType: 'good-first-issue',
        dateFilter: ''
    });

    // Handle form input changes
    const handleChange = (e) => {
        // Update Specific Field in formData
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            {/* Language Selection Dropdown */}
            <select name="language" value={formData.language} onChange={handleChange}>
                <option value="">All Languages</option>
                <option value="javaScript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="ruby">Ruby</option>
                <option value="c++">C++</option>
                <option value="c#">C#</option>
                <option value="php">PHP</option>
                <option value="react">React</option>
                <option value="node">Node.js</option>
                <option value="vue">Vue.js</option>
            </select>

            {/* Issue Type Selection Dropdown */}
            <select name="issueType" value={formData.issueType} onChange={handleChange}>
                <option value="good-first-issue">Good First Issue</option>
                <option value="help-wanted">Help Wanted</option>
                <option value="bug">Bug</option>
                <option value="enhancement">Enhancement</option>
                <option value="all">All Issues</option>
            </select>

            {/* Date Filter Selection */}
            <select name="dateFilter" value={formData.dateFilter} onChange={handleChange}>
                <option value="">Any Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
            </select>

            {/* Submit Button */}
            <button type="submit">Search Issues</button>
        </form>
    );
};

export default SearchForm;