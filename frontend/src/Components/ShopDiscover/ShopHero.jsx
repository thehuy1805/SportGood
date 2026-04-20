import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShopHero.css';
import { ChevronRight, Zap, Award, Truck } from 'lucide-react';

const heroImages = [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
];

const shopCategories = [
    { label: 'Shop All', icon: '⚡' },
    { label: 'Men', icon: '👕' },
    { label: 'Women', icon: '👟' },
    { label: 'Sports Equipment', icon: '🏋️' },
];

const ShopHero = () => {
    const [visible, setVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleBrowse = (category) => {
        if (category === 'Shop All') {
            navigate('/shop');
        } else if (category === 'Men') {
            navigate('/men');
        } else if (category === 'Women') {
            navigate('/women');
        } else if (category === 'Sports Equipment') {
            navigate('/sport-equipment');
        }
    };

    return (
        <div className={`shop-hero ${visible ? 'shop-hero-visible' : ''}`}>
            {/* Background Slideshow */}
            <div className="shop-hero-bg">
                {heroImages.map((img, idx) => (
                    <div
                        key={idx}
                        className={`shop-hero-slide ${idx === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="shop-hero-overlay" />
            </div>

            {/* Animated shapes */}
            <div className="shop-hero-shapes">
                <div className="shape-circle circle-1" />
                <div className="shape-circle circle-2" />
                <div className="shape-circle circle-3" />
            </div>

            {/* Content */}
            <div className="shop-hero-content">
                <div className="shop-hero-inner">
                    {/* Top badge */}
                    <div className="shop-hero-badge">
                        <Zap size={13} />
                        <span>Premium Sports Gear Store</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="shop-hero-title">
                        Discover
                        <br />
                        <span className="shop-hero-title-accent">Premium Sports</span>
                        <br />
                        Gear
                    </h1>

                    {/* Subtext */}
                    <p className="shop-hero-desc">
                        Top quality &bull; Unlimited style &bull; Every day
                    </p>

                    {/* CTA buttons */}
                    <div className="shop-hero-actions">
                        <button
                            className="shop-hero-btn-primary"
                            onClick={() => {
                                const section = document.getElementById('shop-products-grid');
                                if (section) {
                                    const offset = section.getBoundingClientRect().top + window.scrollY - 80;
                                    window.scrollTo({ top: offset, behavior: 'smooth' });
                                }
                            }}
                        >
                            Browse Collections
                            <ChevronRight size={18} />
                        </button>
                        <button
                            className="shop-hero-btn-secondary"
                            onClick={() => navigate('/shop')}
                        >
                            Shop by Sport
                        </button>
                    </div>

                    {/* Quick stats */}
                    <div className="shop-hero-stats">
                        <div className="stat-box">
                            <Award size={18} />
                            <div>
                                <span className="stat-num">500+</span>
                                <span className="stat-label">Premium Products</span>
                            </div>
                        </div>
                        <div className="stat-divider-v" />
                        <div className="stat-box">
                            <Truck size={18} />
                            <div>
                                <span className="stat-num">Fast Shipping</span>
                                <span className="stat-label">On all orders</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Category quick nav */}
                <div className="shop-hero-nav">
                    <p className="shop-hero-nav-label">Jump to</p>
                    {shopCategories.map((cat) => (
                        <button
                            key={cat.label}
                            className="shop-hero-nav-btn"
                            onClick={() => handleBrowse(cat.label)}
                        >
                            <span className="nav-btn-icon">{cat.icon}</span>
                            <span className="nav-btn-text">{cat.label}</span>
                            <ChevronRight size={14} className="nav-btn-arrow" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="shop-hero-scroll">
                <div className="scroll-line" />
                <span>Scroll</span>
            </div>

            {/* Slide dots */}
            <div className="shop-hero-dots">
                {heroImages.map((_, idx) => (
                    <button
                        key={idx}
                        className={`dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShopHero;
