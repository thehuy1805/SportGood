import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HerStory.css';
import API_BASE_URL from '../../config';

const HerStory = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const generateSlug = (name) => {
        if (!name) return '';
        return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    useEffect(() => {
        fetch(`${API_BASE_URL}/allproducts`)
            .then(res => res.json())
            .then(data => {
                const womenProducts = data
                    .filter(p => p.generalCategory === 'Women')
                    .slice(0, 4);
                setProducts(womenProducts);
            })
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    const categoryIcons = {
        'Club Jerseys': '⚽',
        'National Team Jerseys': '🏆',
        'Basketball Clothing': '🏀',
        'Swimwear': '🏊‍♀️',
    };

    const categoryColors = {
        'Club Jerseys': '#3b82f6',
        'National Team Jerseys': '#10b981',
        'Basketball Clothing': '#f97316',
        'Swimwear': '#06b6d4',
    };

    return (
        <section className="her-story">
            <div className="her-story-container">
                <div className="her-story-header">
                    <span className="her-story-tag">Behind the Design</span>
                    <h2 className="her-story-title">Her Story</h2>
                    <p className="her-story-subtitle">
                        Every piece has a story. Discover the inspiration and the women behind our collections.
                    </p>
                </div>

                <div className="stories-grid">
                    {products.map((product) => (
                        <div key={product.id} className="story-card">
                            <div 
                                className="story-accent"
                                style={{ 
                                    background: `linear-gradient(135deg, ${categoryColors[product.detailedCategory] || '#a78bfa'}, ${categoryColors[product.detailedCategory] || '#a78bfa'}40)` 
                                }}
                            />
                            
                            <div className="story-icon-wrapper">
                                <span className="story-icon">
                                    {categoryIcons[product.detailedCategory] || '✨'}
                                </span>
                            </div>

                            <span className="story-category">{product.detailedCategory}</span>
                            
                            <h3 className="story-product-name">{product.name}</h3>
                            
                            <p className="story-text">
                                {product.herStoryDescription || product.description}
                            </p>

                            <button
                                className="story-btn"
                                onClick={() => navigate(`/product/${generateSlug(product.name)}`)}
                            >
                                <span>Discover More</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HerStory;
