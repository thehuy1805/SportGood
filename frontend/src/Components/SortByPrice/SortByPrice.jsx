import React, { useState } from 'react';
import './SortByPrice.css';

const SortByPrice = ({ onSortChange, onReset, initialSortOrder = 'rating' }) => {
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
        if (typeof onSortChange === 'function') {
            onSortChange(event.target.value);
        }
    };

    const handleResetClick = () => {
        setSortOrder(initialSortOrder);
        if (typeof onReset === 'function') {
            onReset();
        }
    };

    return (
        <div className={`sidebar-section sort-section ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-section-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="sidebar-section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="12" x2="14" y2="12"></line>
                        <line x1="4" y1="18" x2="8" y2="18"></line>
                    </svg>
                </div>
                <span className="sidebar-section-title">Sort & Filter</span>
                <span className="sidebar-section-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </div>
            <div className="sidebar-section-body">
                <div className="sort-body-inner">
                    <label className="sort-label">Sort by</label>
                    <div className="sort-select-wrapper">
                        <select
                            className="sort-select"
                            value={sortOrder}
                            onChange={handleSortChange}
                        >
                            <option value="rating">Avg Customer Rating</option>
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                        </select>
                        <span className="sort-select-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </span>
                    </div>
                    <button className="reset-button" onClick={handleResetClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 .49-3.5"></path>
                        </svg>
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SortByPrice;