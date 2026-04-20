import React from 'react';
import './TodaysChallenge.css';

const challenges = [
    {
        id: 1,
        name: 'Full Leg Day Kit',
        duration: '45 min',
        difficulty: 'Advanced',
        icon: '🦵',
        color: '#06b6d4',
        items: [
            { name: 'Resistance Bands Set', price: 29 },
            { name: 'Ankle Weights 5lb', price: 35 },
            { name: 'Compression Leggings', price: 59 },
            { name: 'Training Shoes', price: 89 },
        ],
        total: 212,
        bundlePrice: 179,
    },
    {
        id: 2,
        name: 'Upper Body Blast',
        duration: '30 min',
        difficulty: 'Intermediate',
        icon: '💪',
        color: '#a855f7',
        items: [
            { name: 'Dumbbell Set 20lb', price: 45 },
            { name: 'Wrist Wraps', price: 15 },
            { name: 'Tank Top Pro', price: 35 },
            { name: 'Gym Gloves', price: 22 },
        ],
        total: 117,
        bundlePrice: 99,
    },
    {
        id: 3,
        name: 'HIIT Cardio Pack',
        duration: '20 min',
        difficulty: 'Beginner',
        icon: '🔥',
        color: '#f43f5e',
        items: [
            { name: 'Jump Rope Speed', price: 18 },
            { name: 'Foam Roller', price: 28 },
            { name: 'Breathable Shorts', price: 38 },
            { name: 'Running Cap', price: 25 },
        ],
        total: 109,
        bundlePrice: 89,
    },
];

const TodaysChallenge = () => {
    return (
        <section className="todays-challenge">
            <div className="challenge-header">
                <div className="challenge-badge">
                    <span className="badge-fire">🔥</span>
                    <span className="badge-text">Daily Workout</span>
                </div>
                <h2 className="challenge-title">Today's Challenge</h2>
                <p className="challenge-subtitle">
                    Complete gear combo for your workout. Save more with bundles.
                </p>
            </div>

            <div className="challenges-grid">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-card">
                        <div 
                            className="challenge-accent"
                            style={{ background: challenge.color }}
                        />

                        <div className="challenge-top">
                            <div className="challenge-icon-wrapper">
                                <span className="challenge-icon">{challenge.icon}</span>
                            </div>
                            <div className="challenge-meta">
                                <span className="challenge-duration">{challenge.duration}</span>
                                <span className="challenge-difficulty">{challenge.difficulty}</span>
                            </div>
                        </div>

                        <h3 className="challenge-name">{challenge.name}</h3>

                        <div className="challenge-items">
                            {challenge.items.map((item, index) => (
                                <div key={index} className="challenge-item">
                                    <span className="item-check">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </span>
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-price">${item.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="challenge-pricing">
                            <div className="pricing-total">
                                <span className="total-label">Total Value</span>
                                <span className="total-price">${challenge.total}</span>
                            </div>
                            <div className="pricing-bundle">
                                <span className="bundle-label">Bundle Price</span>
                                <span className="bundle-price">${challenge.bundlePrice}</span>
                            </div>
                            <span className="savings-badge">
                                Save ${challenge.total - challenge.bundlePrice}
                            </span>
                        </div>

                        <button className="challenge-btn">
                            <span>Get This Kit</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TodaysChallenge;
