import React, { useState, useRef, useEffect } from 'react';

import MenProduct from '../Components/MenProduct/MenProduct'; 
import MenSidebar from '../Components/MenSidebar/MenSidebar';
import MenHero from '../Components/MenHero/MenHero';
import CategoryFeatures from '../Components/CategoryFeatures/CategoryFeatures';
import CategoryCollections from '../Components/CategoryCollections/CategoryCollections';
import CategoryPromo from '../Components/CategoryPromo/CategoryPromo';
import AthletesChoice from '../Components/AthletesChoice/AthletesChoice';

import './CSS/Men.css';

export const Men = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('rating');
    const [detailedCategory, setDetailedCategory] = useState(''); 
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
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
        setPriceRange({ min: '', max: '' });
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
    }, [searchTerm, sortOrder, detailedCategory]); 

    const handleBeforeChange = () => {
        pagePositionRef.current = window.pageYOffset;
    };

    return (
        <div className="men-container">
            <MenHero />
            <CategoryFeatures category="Men" />
            <CategoryCollections category="Men" onSelectCollection={handleCollectionSelect} />
            <CategoryPromo category="Men" />
            <AthletesChoice />
            
            <div className="men-content" id="products">
                <div className="sidebar-men">
            <MenSidebar 
                onSearch={term => { handleBeforeChange(); handleSearch(term); }}
                onDetailedCategorySelect={category => { 
                    handleBeforeChange(); 
                    setDetailedCategory(category); 
                }}
                onReset={handleReset}
                onPriceChange={setPriceRange}
                onSortChange={handleSortChange}
            />
                </div>
                <div className="main-content">
                    <MenProduct 
                        searchTerm={searchTerm} 
                        sortOrder={sortOrder} 
                        detailedCategory={detailedCategory}
                        priceRange={priceRange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Men;
