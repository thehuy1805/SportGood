import React, { useState, useEffect, useRef } from 'react';
import SportsItem from '../SportsItem/SportsItem';
import './SportsProduct.css';
import API_BASE_URL from '../../config';

const SportsProduct = ({ 
    searchTerm, 
    sortOrder, 
    selectedCategory, 
    detailedCategory,
    activeTab 
}) => {
    const [products, setProducts] = useState([]);
    const [productFeedbacks, setProductFeedbacks] = useState({});
    const shelfRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/allproducts`);
                const data = await response.json();
                
                const sportsProducts = data.filter(product => product.generalCategory === "Sports Equipment");
                setProducts(sportsProducts); 

                const feedbacksPromises = sportsProducts.map(async (product) => {
                  const feedbackResponse = await fetch(`${API_BASE_URL}/get-feedbacks/${product.id}`);
                  const feedbackData = await feedbackResponse.json();
                  return { productId: product.id, feedbacks: feedbackData };
                });

                const allFeedbacks = await Promise.all(feedbacksPromises);
                const feedbacksObj = allFeedbacks.reduce((acc, curr) => {
                  acc[curr.productId] = curr.feedbacks;
                  return acc;
                }, {});

                setProductFeedbacks(feedbacksObj);

            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const tabCategoryMap = {
        all: null,
        apparel: 'Apparel',
        accessories: 'Accessories',
        training: 'Training Gear',
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        const matchesDetailedCategory = detailedCategory ? product.detailedCategory === detailedCategory : true;
        const matchesTab = tabCategoryMap[activeTab] ? product.detailedCategory === tabCategoryMap[activeTab] : true;
        return matchesSearch && matchesCategory && matchesDetailedCategory && matchesTab;
    });

    const calculateAverageRating = (feedbacks) => {
        if (!feedbacks || feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        return sum / feedbacks.length;
    };

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.new_price - b.new_price;
        } else if (sortOrder === 'desc') {
            return b.new_price - a.new_price;
        } else if (sortOrder === 'rating') {
            const aRating = calculateAverageRating(productFeedbacks[a.id]);
            const bRating = calculateAverageRating(productFeedbacks[b.id]);
            return bRating - aRating;
        }
        return 0;
    });

    // Interactive Shelf Groups
    const tabShelfGroups = {
        all: [
            { name: 'Home Gym', icon: '🏋️', products: filteredProducts.slice(0, 3) },
            { name: 'Outdoor Training', icon: '🏃', products: filteredProducts.slice(3, 6) },
            { name: 'Team Sports', icon: '⚽', products: filteredProducts.slice(6, 9) },
            { name: 'Cardio Equipment', icon: '🚴', products: filteredProducts.slice(9, 12) },
        ],
        apparel: [
            { name: 'Training Tops', icon: '👕', products: filteredProducts.slice(0, 3) },
            { name: 'Sport Shorts', icon: '🩳', products: filteredProducts.slice(3, 6) },
            { name: 'Athletic Wear', icon: '🎽', products: filteredProducts.slice(6, 9) },
        ],
        accessories: [
            { name: 'Bags & Packs', icon: '🎒', products: filteredProducts.slice(0, 3) },
            { name: 'Fitness Gear', icon: '🧤', products: filteredProducts.slice(3, 6) },
            { name: 'Water Bottles', icon: '💧', products: filteredProducts.slice(6, 9) },
        ],
        training: [
            { name: 'Strength Training', icon: '🏋️', products: filteredProducts.slice(0, 3) },
            { name: 'Cardio Gear', icon: '🚴', products: filteredProducts.slice(3, 6) },
            { name: 'Recovery Tools', icon: '🧘', products: filteredProducts.slice(6, 9) },
        ],
    };

    const shelfGroups = tabShelfGroups[activeTab] || tabShelfGroups.all;

    const scrollShelfLeft = () => {
        if (shelfRef.current) {
            shelfRef.current.scrollBy({ left: -340, behavior: 'smooth' });
        }
    };

    const scrollShelfRight = () => {
        if (shelfRef.current) {
            shelfRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
    };

    return (
        <div className="sports-product-container">
            {/* Interactive Shelf */}
            <div className="interactive-shelf">
                <div className="shelf-header">
                    <span className="shelf-title">Shop by Category</span>
                    <div className="shelf-nav">
                        <button className="shelf-nav-btn" onClick={scrollShelfLeft}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button className="shelf-nav-btn" onClick={scrollShelfRight}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="shelf-track" ref={shelfRef}>
                    {shelfGroups.map((group, index) => (
                        <div key={index} className="shelf-group">
                            <div className="shelf-group-header">
                                <span className="shelf-group-icon">{group.icon}</span>
                                <span className="shelf-group-name">{group.name}</span>
                                <span className="shelf-group-count">{group.products.length} items</span>
                            </div>
                            <div className="shelf-group-products">
                                {group.products.map((product) => (
                                    <a 
                                        key={product.id} 
                                        href={`/product/${product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`}
                                        className="shelf-product"
                                    >
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="shelf-product-image"
                                        />
                                        <div className="shelf-product-info">
                                            <div className="shelf-product-name">{product.name}</div>
                                            <div className="shelf-product-price">${product.new_price}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Products Header */}
            <div className="products-header">
                <span className="products-count">
                    Showing <span>{sortedProducts.length}</span> products
                </span>
            </div>

            {/* Products Grid */}
            <div className="sports-products-grid">
                {sortedProducts.map((product) => (
                    <div key={product.id} className="sports-product-item">
                        <SportsItem
                            id={product.id}
                            name={product.name}
                            image={product.image}
                            new_price={product.new_price}
                            old_price={product.old_price}
                            feedbacks={productFeedbacks[product.id]}
                        />
                    </div>
                ))}
            </div>

            {sortedProducts.length === 0 && (
                <div className="no-products">
                    <span className="no-products-icon">💪</span>
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
};

export default SportsProduct;
