import React, { useState, useEffect, useRef } from 'react';
import Item from '../../Components/Item/Item';
import './MenProduct.css';
import API_BASE_URL from '../../config';

const MenProduct = ({ 
    searchTerm, 
    sortOrder, 
    detailedCategory,
    priceRange = { min: '', max: '' }
}) => {
    const [products, setProducts] = useState([]);
    const [productFeedbacks, setProductFeedbacks] = useState({});
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/allproducts`);
                const data = await response.json();
                
                const menProducts = data.filter(product => product.generalCategory === "Men");
                setProducts(menProducts); 

                const feedbacksPromises = menProducts.map(async (product) => {
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesDetailedCategory = detailedCategory ? product.detailedCategory === detailedCategory : true;
        
        // Price filter
        let matchesPrice = true;
        if (priceRange.min !== '') {
            matchesPrice = matchesPrice && product.new_price >= parseFloat(priceRange.min);
        }
        if (priceRange.max !== '') {
            matchesPrice = matchesPrice && product.new_price <= parseFloat(priceRange.max);
        }
        
        return matchesSearch && matchesDetailedCategory && matchesPrice;
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

    // Get top rated products for horizontal scroll
    const topPicks = [...products]
        .sort((a, b) => {
            const aRating = calculateAverageRating(productFeedbacks[a.id]);
            const bRating = calculateAverageRating(productFeedbacks[b.id]);
            return bRating - aRating;
        })
        .slice(0, 6);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
        }
    };

    return (
        <div className="men-product-container">
            {/* Top Performance Picks - Horizontal Scroll */}
            {topPicks.length > 0 && (
                <div className="top-picks-section">
                    <div className="top-picks-header">
                        <span className="top-picks-title">Top Performance Picks</span>
                        <div className="top-picks-nav">
                            <button className="nav-btn" onClick={scrollLeft}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button className="nav-btn" onClick={scrollRight}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="top-picks-scroll" ref={scrollRef}>
                        {topPicks.map(product => (
                            <a 
                                key={product.id} 
                                href={`/product/${product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`}
                                className="top-pick-item"
                            >
                                <img src={product.image} alt={product.name} className="top-pick-image" />
                                <div className="top-pick-info">
                                    <div className="top-pick-name">{product.name}</div>
                                    <div className="top-pick-price">${product.new_price}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Header */}
            <div className="products-header">
                <span className="products-count">
                    Showing <span>{sortedProducts.length}</span> products
                </span>
            </div>

            {/* Masonry Grid */}
            <div className="masonry-grid">
                {sortedProducts.map((product, index) => (
                    <div key={product.id} className="masonry-item" data-index={index}>
                        <Item
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
                    <span className="no-products-icon">🔍</span>
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
};

export default MenProduct;
