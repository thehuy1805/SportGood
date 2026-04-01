import React, { useState, useRef, useEffect } from 'react';
import AllProduct from '../Components/AllProduct/AllProduct';
import KeywordSearch from '../Components/KeywordSearch/KeywordSearch';
import SortByPrice from '../Components/SortByPrice/SortByPrice';
import ProductCategory from '../Components/ProductCategory/ProductCategory';
import './CSS/HomeShop.css';

const HomeShop = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
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
        setSelectedCategory('');
        setDetailedCategory('');
    };

    useEffect(() => {
        if (pagePositionRef.current != null) {
            window.scrollTo(0, pagePositionRef.current);
        }
    }, [searchTerm, sortOrder, detailedCategory]);

    const handleBeforeChange = () => {
        pagePositionRef.current = window.pageYOffset;
    };

    return (
        <div className="home-shop-container">
            <div className="shop-home-layout">
                <div className="sidebar-shop">
                    <KeywordSearch onSearch={term => { handleBeforeChange(); handleSearch(term); }} />
                    <SortByPrice
                        onSortChange={sortOption => { handleBeforeChange(); handleSortChange(sortOption); }}
                        onReset={handleReset}
                        initialSortOrder="rating"
                    />
                    <ProductCategory
                        onDetailedCategorySelect={category => {
                            handleBeforeChange();
                            setDetailedCategory(category);
                        }}
                    />
                </div>
                <div className="shop-home-main">
                    <AllProduct
                        searchTerm={searchTerm}
                        sortOrder={sortOrder}
                        selectedCategory={selectedCategory}
                        detailedCategory={detailedCategory}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomeShop;
