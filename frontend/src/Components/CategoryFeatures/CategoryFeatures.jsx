import React from 'react';
import './CategoryFeatures.css';

const categoryData = {
    Men: {
        title: 'Why Men Choose Us',
        features: [
            {
                title: 'Premium Fabrics',
                description: 'High-performance materials that keep you cool and dry during any workout.',
            },
            {
                title: 'Perfect Fit',
                description: 'Ergonomic design with 4-way stretch for maximum mobility and comfort.',
            },
            {
                title: 'Built to Last',
                description: 'Reinforced construction that maintains quality wash after wash.',
            },
            {
                title: 'Modern Style',
                description: 'Clean designs that transition seamlessly from gym to everyday wear.',
            },
        ],
        accent: '#3b82f6',
    },
    Women: {
        title: 'Why Women Love Us',
        features: [
            {
                title: 'Ultra Comfort',
                description: 'Buttery soft fabrics that move with you throughout your entire day.',
            },
            {
                title: 'Flattering Fit',
                description: 'Thoughtfully designed silhouettes that celebrate every body type.',
            },
            {
                title: 'Light as Air',
                description: 'Feather-light construction that never weighs you down.',
            },
            {
                title: 'Endless Style',
                description: 'Versatile pieces that take you from workout to weekend plans.',
            },
        ],
        accent: '#ec4899',
    },
    'Sports Equipment': {
        title: 'Equipment Built for Champions',
        features: [
            {
                title: 'Pro Grade',
                description: 'Competition-level quality used by athletes worldwide.',
            },
            {
                title: 'Innovation',
                description: 'Cutting-edge engineering for peak performance results.',
            },
            {
                title: 'Rock Solid',
                description: 'Heavy-duty materials designed for intense training.',
            },
            {
                title: 'All Levels',
                description: 'From beginner-friendly to competition-ready equipment.',
            },
        ],
        accent: '#10b981',
    },
};

const CategoryFeatures = ({ category }) => {
    const data = categoryData[category] || categoryData.Men;

    return (
        <div className="category-features">
            <div className="features-header">
                <h2 className="features-title">{data.title}</h2>
            </div>
            <div className="features-grid">
                {data.features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <div className="feature-number" style={{ color: data.accent }}>
                            0{index + 1}
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-desc">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFeatures;
