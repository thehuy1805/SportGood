import React, { useState } from 'react';
import './KeywordSearch.css';

const KeywordSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        onSearch(event.target.value);
    };

    const handleInputChange = (event) => {
        event.preventDefault();
        onSearch(event.target.value);
    };

    return (
        <div className={`sidebar-section keyword-search-section ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-section-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="sidebar-section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <span className="sidebar-section-title">Search</span>
                <span className="sidebar-section-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </div>
            <div className="sidebar-section-body">
                <div className="searchKey-wrapper">
                    <input
                        className="searchKey-input"
                        type="text"
                        placeholder="Search for products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleInputChange(e);
                            }
                        }}
                    />
                    {searchTerm && (
                        <button
                            className="search-clear-btn"
                            onClick={() => {
                                setSearchTerm('');
                                onSearch('');
                            }}
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeywordSearch;
