import React, { useState, useEffect } from 'react';
import './AthletesChoice.css';
import API_BASE_URL from '../../config';

const AthletesChoice = () => {
    const [pickedProducts, setPickedProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/allproducts`);
                const data = await response.json();
                const menProducts = data.filter(product => product.generalCategory === "Men");

                if (menProducts.length === 0) return;

                const shuffled = [...menProducts].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 4);

                const athletesData = selected.map((product, index) => {
                    const pickNames = {
                        0: { name: 'Marcus Johnson', sport: 'NBA Power Forward', avatar: '🏀' },
                        1: { name: 'Alex Chen', sport: 'Professional Soccer', avatar: '⚽' },
                        2: { name: 'James Williams', sport: 'NBA Shooting Guard', avatar: '🏀' },
                        3: { name: 'Diego Martinez', sport: 'Pro Soccer Player', avatar: '⚽' },
                    };
                    const quotes = [
                        `"The fit is incredible. I've never felt more comfortable on the court."`,
                        `"Top-notch quality. Worth every penny — I use it every single day."`,
                        `"Perfect for training sessions. Highly recommend to anyone serious about performance."`,
                        `"Exceeded all my expectations. Stylish, durable, and incredibly comfortable."`,
                    ];
                    return {
                        id: index + 1,
                        ...pickNames[index],
                        quote: quotes[index],
                        pick: product.name,
                        productSlug: product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    };
                });

                setPickedProducts(athletesData);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section className="athletes-choice">
            <div className="athletes-header">
                <div className="athletes-badge">
                    <span className="badge-icon">⭐</span>
                    <span className="badge-text">Elite Picks</span>
                </div>
                <h2 className="athletes-title">Athlete's Choice</h2>
                <p className="athletes-subtitle">
                    Hand-picked by world-class athletes who demand the best
                </p>
            </div>

            <div className="athletes-grid">
                {pickedProducts.map((athlete) => (
                    <div key={athlete.id} className="athlete-card">
                        <div className="athlete-header">
                            <div className="athlete-avatar">{athlete.avatar}</div>
                            <div className="athlete-info">
                                <h3 className="athlete-name">{athlete.name}</h3>
                                <span className="athlete-sport">{athlete.sport}</span>
                            </div>
                            <div className="athlete-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                Top Pick
                            </div>
                        </div>

                        <div className="athlete-quote">
                            <span className="quote-mark">"</span>
                            <p>{athlete.quote}</p>
                        </div>

                        <div className="athlete-pick">
                            <span className="pick-label">Their Pick</span>
                            <span className="pick-name">{athlete.pick}</span>
                        </div>

                        <div className="athlete-action">
                            <a
                                href={`/product/${athlete.productSlug}`}
                                className="pick-btn"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                Shop This Look
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AthletesChoice;
