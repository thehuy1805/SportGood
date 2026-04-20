import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import './MenSidebar.css';

const MenSidebar = ({ 
    onSearch, 
    onDetailedCategorySelect,
    onReset,
    onPriceChange,
    onSortChange
}) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [selectedSort, setSelectedSort] = useState('rating');
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/getDetailedCategories`);
                const data = await response.json();
                console.log('Categories API response:', data);
                
                if (data.success && data.categories && data.categories.length > 0) {
                    const menCategories = data.categories.filter(c => c.generalCategory === 'Men');
                    console.log('Men categories:', menCategories);
                    setCategories(menCategories);
                } else {
                    // Fallback: get unique categories from products
                    console.log('No categories from API, fetching from products...');
                    const productsRes = await fetch(`${API_BASE_URL}/allproducts`);
                    const productsData = await productsRes.json();
                    const menProducts = productsData.filter(p => p.generalCategory === 'Men');
                    
                    // Extract unique detailedCategory
                    const uniqueCategories = [...new Set(menProducts.map(p => p.detailedCategory))];
                    const categoryList = uniqueCategories.map(name => ({
                        _id: name,
                        name: name,
                        productCount: menProducts.filter(p => p.detailedCategory === name).length
                    }));
                    
                    console.log('Categories from products:', categoryList);
                    setCategories(categoryList);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory('');
            onDetailedCategorySelect('');
        } else {
            setSelectedCategory(categoryName);
            onDetailedCategorySelect(categoryName);
        }
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        onSearch(e.target.value);
    };

    const handlePriceFilter = () => {
        if (onPriceChange) {
            onPriceChange({ min: priceMin, max: priceMax });
        }
    };

    const handleSortChange = (sortValue) => {
        setSelectedSort(sortValue);
        if (onSortChange) {
            onSortChange(sortValue);
        }
    };

    const handleReset = () => {
        setSelectedCategory('');
        setSearchValue('');
        setPriceMin('');
        setPriceMax('');
        setSelectedSort('rating');
        if (onReset) onReset();
    };

    return (
        <div className="men-sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <span className="sidebar-title">Filters</span>
            </div>

            {/* Search */}
            <div className="filter-section">
                <div className="filter-section-header">
                    <span className="filter-section-title">Search</span>
                </div>
                <div className="filter-section-body">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        <input 
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="filter-section">
                <div className="filter-section-header">
                    <span className="filter-section-title">Categories</span>
                </div>
                <div className="filter-section-body">
                    {loadingCategories ? (
                        <div className="loading-text">Loading...</div>
                    ) : categories.length > 0 ? (
                        <div className="filter-list">
                            <button
                                className={`filter-item ${selectedCategory === '' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('')}
                            >
                                <span>All Products</span>
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category._id}
                                    className={`filter-item ${selectedCategory === category.name ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    <span>{category.name}</span>
                                    {category.productCount > 0 && (
                                        <span className="chip-count">{category.productCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="no-categories">No categories found</div>
                    )}
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <div className="filter-section-header">
                    <span className="filter-section-title">Price</span>
                </div>
                <div className="filter-section-body">
                    <div className="price-inputs">
                        <input
                            type="number"
                            className="price-input"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                        />
                        <span className="price-divider">-</span>
                        <input
                            type="number"
                            className="price-input"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                        />
                        <button className="apply-price-btn" onClick={handlePriceFilter}>Go</button>
                    </div>
                </div>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
                <div className="filter-section-header">
                    <span className="filter-section-title">Sort By</span>
                </div>
                <div className="filter-section-body">
                    <div className="sort-options">
                        <button
                            className={`sort-option ${selectedSort === 'rating' ? 'active' : ''}`}
                            onClick={() => handleSortChange('rating')}
                        >
                            Top Rated
                        </button>
                        <button
                            className={`sort-option ${selectedSort === 'asc' ? 'active' : ''}`}
                            onClick={() => handleSortChange('asc')}
                        >
                            Price: Low to High
                        </button>
                        <button
                            className={`sort-option ${selectedSort === 'desc' ? 'active' : ''}`}
                            onClick={() => handleSortChange('desc')}
                        >
                            Price: High to Low
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <button className="filter-reset-btn" onClick={handleReset}>
                Reset All
            </button>
        </div>
    );
};

export default MenSidebar;
