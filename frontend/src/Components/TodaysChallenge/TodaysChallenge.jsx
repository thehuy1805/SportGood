import React, { useState, useEffect, useContext } from 'react';
import './TodaysChallenge.css';
import { ShopContext } from '../../Context/ShopContext';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const TodaysChallenge = () => {
    const { addToCart, cart, isLoggedIn } = useContext(ShopContext);
    const [challenges, setChallenges] = useState([]);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingIds, setLoadingIds] = useState(new Set());

    useEffect(() => {
        fetchChallenges();
        if (isLoggedIn) {
            fetchCompletedChallenges();
        }
    }, [isLoggedIn]);

    const fetchChallenges = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/challenges`);
            const data = await res.json();
            if (data.success) {
                setChallenges(data.challenges);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedChallenges = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch(`${API_BASE_URL}/api/challenges/completed`, {
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (data.success) {
                setCompletedChallenges(data.completedChallenges.map(cc => cc.challengeId.toString()));
            }
        } catch (error) {
            console.error('Error fetching completed challenges:', error);
        }
    };

    const handleGetThisKit = async (challenge) => {
        if (!isLoggedIn) {
            toast.info('Please log in to add challenge kit to your cart!');
            return;
        }

        setLoadingIds(prev => new Set([...prev, challenge._id]));

        try {
            // Add each item to cart
            for (const item of challenge.items) {
                addToCart(item.productId, 'default');
            }
            toast.success(`${challenge.name} added to your cart!`);
        } catch (error) {
            console.error('Error adding kit to cart:', error);
            toast.error('Failed to add kit to cart');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(challenge._id);
                return next;
            });
        }
    };

    const handleCompleteChallenge = async (challenge) => {
        if (!isLoggedIn) {
            toast.info('Please log in to complete challenges!');
            return;
        }

        if (completedChallenges.includes(challenge._id.toString())) {
            toast.info('You already completed this challenge!');
            return;
        }

        setLoadingIds(prev => new Set([...prev, challenge._id]));

        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch(`${API_BASE_URL}/api/challenges/${challenge._id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({ addToCart: true })
            });
            const data = await res.json();

            if (data.success) {
                setCompletedChallenges(prev => [...prev, challenge._id.toString()]);
                toast.success(data.message || 'Challenge completed! Products added to cart.');
            } else {
                toast.error(data.error || 'Failed to complete challenge');
            }
        } catch (error) {
            console.error('Error completing challenge:', error);
            toast.error('Failed to complete challenge');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(challenge._id);
                return next;
            });
        }
    };

    const isCompleted = (challengeId) => completedChallenges.includes(challengeId.toString());
    const isLoading = (challengeId) => loadingIds.has(challengeId);

    if (loading) {
        return (
            <section className="todays-challenge">
                <div className="challenge-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading today's challenges...</p>
                </div>
            </section>
        );
    }

    if (challenges.length === 0) {
        return (
            <section className="todays-challenge">
                <div className="challenge-header">
                    <div className="challenge-badge">
                        <span className="badge-fire">🔥</span>
                        <span className="badge-text">Daily Workout</span>
                    </div>
                    <h2 className="challenge-title">Today's Challenge</h2>
                    <p className="challenge-subtitle">Check back soon for new workout challenges!</p>
                </div>
            </section>
        );
    }

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
                {challenges.map((challenge) => {
                    const completed = isCompleted(challenge._id);
                    const loading = isLoading(challenge._id);

                    return (
                        <div
                            key={challenge._id}
                            className={`challenge-card ${completed ? 'challenge-completed' : ''}`}
                        >
                            {completed && (
                                <div className="completed-overlay">
                                    <span className="completed-badge">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Completed
                                    </span>
                                </div>
                            )}

                            <div
                                className="challenge-accent"
                                style={{ background: challenge.color }}
                            />

                            <div className="challenge-top">
                                <div
                                    className="challenge-icon-wrapper"
                                    style={{ background: `${challenge.color}20` }}
                                >
                                    <span className="challenge-icon">{challenge.icon}</span>
                                </div>
                                <div className="challenge-meta">
                                    <span className="challenge-duration">{challenge.duration}</span>
                                    <span className="challenge-difficulty">{challenge.difficulty}</span>
                                </div>
                            </div>

                            <h3 className="challenge-name">{challenge.name}</h3>

                            <div className="challenge-items">
                                {challenge.items.map((item, index) => {
                                    const inCart = cart[item.productId]?.['default'] > 0;
                                    return (
                                        <div key={index} className={`challenge-item ${inCart ? 'item-in-cart' : ''}`}>
                                            <span className="item-check" style={inCart ? { background: `${challenge.color}40`, color: challenge.color } : {}}>
                                                {inCart ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{index + 1}</span>
                                                )}
                                            </span>
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-price">${item.price}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="challenge-pricing">
                                <div className="pricing-total">
                                    <span className="total-label">Total Value</span>
                                    <span className="total-price">${challenge.total}</span>
                                </div>
                                <div className="pricing-bundle">
                                    <span className="bundle-label">Bundle Price</span>
                                    <span className="bundle-price" style={{ color: challenge.color }}>
                                        ${challenge.bundlePrice}
                                    </span>
                                </div>
                                <span className="savings-badge" style={{ background: `${challenge.color}15`, borderColor: `${challenge.color}30`, color: challenge.color }}>
                                    Save ${challenge.total - challenge.bundlePrice}
                                </span>
                            </div>

                            <div className="challenge-actions">
                                <button
                                    className="challenge-btn challenge-btn-secondary"
                                    onClick={() => handleGetThisKit(challenge)}
                                    disabled={loading}
                                    style={{ borderColor: `${challenge.color}50`, color: challenge.color }}
                                >
                                    {loading ? (
                                        <span className="btn-spinner"></span>
                                    ) : (
                                        <>
                                            <span>Quick Add</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <button
                                    className="challenge-btn challenge-btn-primary"
                                    onClick={() => handleCompleteChallenge(challenge)}
                                    disabled={loading || completed}
                                    style={{ background: completed ? '#10b981' : `linear-gradient(135deg, ${challenge.color}, ${challenge.color}dd)` }}
                                >
                                    {loading ? (
                                        <span className="btn-spinner btn-spinner-light"></span>
                                    ) : completed ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>Completed!</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Complete & Add to Cart</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                            {!isLoggedIn && (
                                <p className="login-hint">Log in to complete challenges & earn rewards</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default TodaysChallenge;
