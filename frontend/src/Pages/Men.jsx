import React, { useState, useRef, useEffect } from 'react';

import MenProduct from '../Components/MenProduct/MenProduct'; 
import KeywordSearch from '../Components/KeywordSearch/KeywordSearch';
import SortByPrice from '../Components/SortByPrice/SortByPrice';
import ProductCategory from '../Components/ProductCategory/ProductCategory';

import './CSS/Men.css';
import men_banner from '../Components/Assets/men_banner.png';

export const Men = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('rating');
    const [detailedCategory, setDetailedCategory] = useState(''); 
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
            <div className="men-banner">
                <img src={men_banner} alt="Banner" />
            </div>
            <div className="men-content">
                <div className="sidebar-men">
                    <KeywordSearch onSearch={term => { handleBeforeChange(); handleSearch(term); }} />
                    <SortByPrice 
                        onSortChange={sortOption => { handleBeforeChange(); handleSortChange(sortOption); }} 
                        onReset={handleReset}
                        initialSortOrder="rating"
                    />
                    <ProductCategory 
                        generalCategory="Men"
                        onDetailedCategorySelect={category => { 
                            handleBeforeChange(); 
                            setDetailedCategory(category); 
                        }} 
                    />
                </div>
                <div className="main-content">
                    <MenProduct 
                        searchTerm={searchTerm} 
                        sortOrder={sortOrder} 
                        detailedCategory={detailedCategory} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Men;