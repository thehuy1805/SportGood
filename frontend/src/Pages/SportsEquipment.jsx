// Trang SportsEquipment.jsx
import React, { useState, useRef, useEffect } from 'react';

import SportsEquipmentProduct from '../Components/SportsEquipmentProduct/SportsEquipmentProduct'; 
import KeywordSearch from '../Components/KeywordSearch/KeywordSearch';
import SortByPrice from '../Components/SortByPrice/SortByPrice';
import ProductCategory from '../Components/ProductCategory/ProductCategory';
import './CSS/SportsEquipment.css'; 
import sportEquipment_banner from '../Components/Assets/sportEquipment_banner.png'; 

export const SportsEquipment = () => {
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
        <div className="sportsEquipment-container"> 
            <div className="sportsEquipment-banner"> 
                <img src={sportEquipment_banner} alt="Banner" /> 
            </div>
            <div className="sportsEquipment-content"> 
                <div className="sidebar-sportsEquipment"> 
                    <KeywordSearch onSearch={term => { handleBeforeChange(); handleSearch(term); }} />
                    <SortByPrice 
                        onSortChange={sortOption => { handleBeforeChange(); handleSortChange(sortOption); }} 
                        onReset={handleReset}
                        initialSortOrder="rating"
                    />
                    <ProductCategory 
                        generalCategory="Sports Equipment" // Thêm generalCategory ở đây
                        onDetailedCategorySelect={category => { 
                            handleBeforeChange(); 
                            setDetailedCategory(category); 
                        }} 
                    />
                </div>
                <div className="main-content">
                    <SportsEquipmentProduct 
                        searchTerm={searchTerm} 
                        sortOrder={sortOrder} 
                        detailedCategory={detailedCategory} 
                    />
                </div>
            </div>
        </div>
    );
};

export default SportsEquipment;