import React, { useState, useRef, useEffect } from 'react';

import SportsProduct from '../Components/SportsProduct/SportsProduct'; 
import SportsHero from '../Components/SportsHero/SportsHero';
import CategoryFeatures from '../Components/CategoryFeatures/CategoryFeatures';
import CategoryCollections from '../Components/CategoryCollections/CategoryCollections';
import CategoryPromo from '../Components/CategoryPromo/CategoryPromo';
import TodaysChallenge from '../Components/TodaysChallenge/TodaysChallenge';
import GearFinder from '../Components/GearFinder/GearFinder';

import './CSS/SportsEquipment.css';

const tabs = [
    { id: 'all', label: 'All Equipment', icon: '🏆' },
    { id: 'apparel', label: 'Apparel', icon: '👕' },
    { id: 'accessories', label: 'Accessories', icon: '🧤' },
    { id: 'training', label: 'Training Gear', icon: '💪' },
];

const filterChips = [
    'Home Gym',
    'Outdoor',
    'Cardio',
    'Strength',
    'Team Sports',
    'Beginner',
    'Pro',
    'Sale',
];

export const SportsEquipment = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('rating');
    const [detailedCategory, setDetailedCategory] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [activeChip, setActiveChip] = useState('');
    const pagePositionRef = useRef(null);

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
        setActiveChip('');
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

    useEffect(() => {
        if (pagePositionRef.current) {
            window.scrollTo(0, pagePositionRef.current);
        }
    }, [searchTerm, sortOrder, detailedCategory, activeTab, activeChip]); 

    const handleBeforeChange = () => {
        pagePositionRef.current = window.pageYOffset;
    };

    return (
        <div className="sportsEquipment-container">
            <SportsHero />
            <CategoryFeatures category="Sports Equipment" />
            <CategoryCollections category="Sports Equipment" onSelectCollection={handleCollectionSelect} />
            <CategoryPromo category="Sports Equipment" />
            <TodaysChallenge />
            
            <div className="sportsEquipment-content" id="products">
                {/* Tab Navigation */}
                <div className="sports-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`sports-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="sports-tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filter Chips Bar */}
                <div className="filter-chips-bar">
                    <button 
                        className={`filter-chip-bar ${activeChip === '' ? 'active' : ''}`}
                        onClick={() => setActiveChip('')}
                    >
                        All
                    </button>
                    {filterChips.map((chip) => (
                        <button
                            key={chip}
                            className={`filter-chip-bar ${activeChip === chip ? 'active' : ''}`}
                            onClick={() => setActiveChip(chip)}
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                {/* Search & Sort */}
                <div className="sports-tools-bar">
                    <div className="sports-search">
                        <svg className="sports-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            className="sports-search-input"
                            placeholder="Search equipment..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="sports-sort">
                        <select 
                            className="sports-sort-select"
                            value={sortOrder}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="rating">Top Rated</option>
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Products */}
                <SportsProduct 
                    searchTerm={searchTerm} 
                    sortOrder={sortOrder} 
                    detailedCategory={detailedCategory}
                    activeTab={activeTab}
                />
            </div>

            {/* Gear Finder AI */}
            <GearFinder />
        </div>
    );
};

export default SportsEquipment;
