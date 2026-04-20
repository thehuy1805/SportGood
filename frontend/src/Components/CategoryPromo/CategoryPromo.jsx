import React from 'react';
import './CategoryPromo.css';

const categoryData = {
    Men: {
        discount: '30%',
        label: 'Limited Time',
        title: 'Summer Training Sale',
        description: 'Up to 30% off on selected gym gear & training equipment. Terms apply.',
        ctaText: 'Shop Sale',
        bgGradient: 'linear-gradient(135deg, #1e3a5f 0%, #1a2744 100%)',
        accent: '#3b82f6',
    },
    Women: {
        discount: '25%',
        label: 'Exclusive',
        title: 'Active Collection',
        description: 'Get 25% off on our new activewear line. Valid for members only.',
        ctaText: 'Shop Collection',
        bgGradient: 'linear-gradient(135deg, #4a1942 0%, #3d1535 100%)',
        accent: '#ec4899',
    },
    'Sports Equipment': {
        discount: '40%',
        label: 'Clearance',
        title: 'Pro Gear Sale',
        description: 'Up to 40% off on professional training equipment. While stocks last.',
        ctaText: 'Browse Deals',
        bgGradient: 'linear-gradient(135deg, #0d3d2d 0%, #0a2f23 100%)',
        accent: '#10b981',
    },
};

const CategoryPromo = ({ category }) => {
    const data = categoryData[category] || categoryData.Men;

    return (
        <div className="category-promo" style={{ background: data.bgGradient }}>
            <div className="promo-inner">
                <div className="promo-discount">
                    <span className="discount-value">{data.discount}</span>
                    <span className="discount-label">OFF</span>
                </div>
                <div className="promo-content">
                    <span className="promo-label" style={{ color: data.accent }}>{data.label}</span>
                    <h3 className="promo-title">{data.title}</h3>
                    <p className="promo-desc">{data.description}</p>
                    <button 
                        className="promo-cta" 
                        style={{ background: data.accent }}
                        onClick={() => {
                            const productsSection = document.getElementById('products');
                            if (productsSection) {
                                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                    >
                        {data.ctaText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryPromo;
