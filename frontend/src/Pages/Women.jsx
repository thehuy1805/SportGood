// Women.jsx
import React, { useState, useRef, useEffect } from 'react';

import WomenProduct from '../Components/WomenProduct/WomenProduct'; 
import KeywordSearch from '../Components/KeywordSearch/KeywordSearch';
import SortByPrice from '../Components/SortByPrice/SortByPrice';
import ProductCategory from '../Components/ProductCategory/ProductCategory';
import './CSS/Women.css';
import women_banner from '../Components/Assets/women_banner.png'; // Thay bằng hình ảnh banner của Women

export const Women = () => {
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
        <div className="women-container"> {/* Thay đổi className */}
            <div className="women-banner"> {/* Thay đổi className */}
                <img src={women_banner} alt="Banner" />
            </div>
            <div className="women-content"> {/* Thay đổi className */}
                <div className="sidebar-women"> {/* Thay đổi className */}
                    <KeywordSearch onSearch={term => { handleBeforeChange(); handleSearch(term); }} />
                    <SortByPrice 
                        onSortChange={sortOption => { handleBeforeChange(); handleSortChange(sortOption); }} 
                        onReset={handleReset}
                        initialSortOrder="rating"
                    />
                    <ProductCategory 
                        generalCategory="Women"
                        onDetailedCategorySelect={category => { 
                            handleBeforeChange(); 
                            setDetailedCategory(category); 
                        }} 
                    />
                </div>
                <div className="main-content">
                    <WomenProduct
                        searchTerm={searchTerm} 
                        sortOrder={sortOrder} 
                        detailedCategory={detailedCategory} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Women;