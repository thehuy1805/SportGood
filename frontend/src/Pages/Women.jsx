import React, { useState } from 'react';

import WomenProduct from '../Components/WomenProduct/WomenProduct'; 
import WomenHero from '../Components/WomenHero/WomenHero';
import CategoryFeatures from '../Components/CategoryFeatures/CategoryFeatures';
import CategoryCollections from '../Components/CategoryCollections/CategoryCollections';
import CategoryPromo from '../Components/CategoryPromo/CategoryPromo';
import HerStory from '../Components/HerStory/HerStory';

import './CSS/Women.css';

export const Women = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('rating');
    const [detailedCategory, setDetailedCategory] = useState('');
    const [availableCategories, setAvailableCategories] = useState([]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleSortChange = (sortOption) => {
        setSortOrder(sortOption);
    };

    const handleReset = () => {
        setSortOrder('rating');
        setDetailedCategory('');
        setSearchTerm('');
    };

    const handleCollectionSelect = (collectionName) => {
        setDetailedCategory(collectionName);
        setTimeout(() => {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="women-container">
            <WomenHero />
            <CategoryFeatures category="Women" />
            <CategoryCollections category="Women" onSelectCollection={handleCollectionSelect} />
            <CategoryPromo category="Women" />
            <HerStory />
            
            <div className="women-content" id="products">
                {/* Top Filter Bar */}
                <div className="women-filter-bar">
                    <div className="filter-tabs">
                        <button className={`filter-tab ${detailedCategory === '' ? 'active' : ''}`}
                            onClick={() => setDetailedCategory('')}>
                            All
                        </button>
                        {availableCategories.map((cat) => (
                            <button 
                                key={cat}
                                className={`filter-tab ${detailedCategory === cat ? 'active' : ''}`}
                                onClick={() => setDetailedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="filter-right">
                        <div className="filter-search">
                            <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="M21 21l-4.35-4.35"></path>
                            </svg>
                            <input 
                                type="text"
                                className="filter-search-input"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="filter-sort">
                            <span className="filter-sort-label">Sort by</span>
                            <select 
                                className="filter-sort-select"
                                value={sortOrder}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="rating">Top Rated</option>
                                <option value="asc">Price: Low to High</option>
                                <option value="desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="women-main">
                    <WomenProduct 
                        searchTerm={searchTerm} 
                        sortOrder={sortOrder} 
                        detailedCategory={detailedCategory}
                        onCategoriesLoaded={setAvailableCategories}
                    />
                </div>
            </div>
        </div>
    );
};

export default Women;
