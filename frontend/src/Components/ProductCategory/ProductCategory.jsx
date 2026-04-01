import React, { useState, useEffect } from 'react';
import './ProductCategory.css';
import axios from 'axios';
import io from 'socket.io-client';

const ProductCategory = ({ generalCategory, onDetailedCategorySelect }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4000/getDetailedCategories');
                if (response.data.success) {
                    let detailedCategories = response.data.categories;

                    if (generalCategory) {
                        detailedCategories = detailedCategories.filter(category => category.generalCategory === generalCategory);
                    }

                    const categoriesWithProducts = detailedCategories.filter(category => category.productCount > 0);

                    const uniqueCategories = new Set();

                    if (window.location.pathname.includes('/sport-equipment')) {
                        ["Soccer Accessories", "Basketball Accessories", "Swimming Accessories"].forEach(cat => uniqueCategories.add(cat));
                    } else if (window.location.pathname === '/shop') {
                        ["Club Jerseys", "National Team Jerseys", "Basketball Clothing", "Swimwear", "Gym Sets", "Soccer Shoes", "Basketball Shoes", "Soccer Accessories", "Basketball Accessories", "Swimming Accessories"].forEach(cat => uniqueCategories.add(cat));
                    } else {
                        ["Club Jerseys", "National Team Jerseys", "Basketball Clothing", "Swimwear", "Gym Sets", "Soccer Shoes", "Basketball Shoes"].forEach(cat => uniqueCategories.add(cat));
                    }

                    categoriesWithProducts.forEach(cat => uniqueCategories.add(cat.name));
                    setCategories(Array.from(uniqueCategories));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();

        const socket = io('http://localhost:4000');
        socket.on('categoriesUpdated', () => {
            fetchCategories();
        });

        return () => {
            socket.disconnect();
        };
    }, [generalCategory]);

    const handleCategoryClick = (category) => {
        const newCategory = selectedCategory === category ? '' : category;
        setSelectedCategory(newCategory);
        onDetailedCategorySelect(newCategory);
    };

    const handleClearCategory = () => {
        setSelectedCategory('');
        onDetailedCategorySelect('');
    };

    return (
        <div className={`sidebar-section category-section ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-section-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="sidebar-section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </div>
                <span className="sidebar-section-title">
                    Categories
                    {selectedCategory && (
                        <span className="category-active-badge">1</span>
                    )}
                </span>
                <span className="sidebar-section-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </div>
            <div className="sidebar-section-body">
                <div className="category-list-wrapper">
                    {selectedCategory && (
                        <div className="category-active-info">
                            <span className="category-active-label">Active:</span>
                            <span className="category-active-name">{selectedCategory}</span>
                            <button className="category-clear-btn" onClick={handleClearCategory} title="Clear filter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    )}
                    <ul className="category-list">
                        {categories.map(category => (
                            <li
                                key={category}
                                className={`category-item ${selectedCategory === category ? 'selected' : ''}`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <span className="category-item-dot"></span>
                                <span className="category-item-name">{category}</span>
                                {selectedCategory === category && (
                                    <span className="category-item-check">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductCategory;