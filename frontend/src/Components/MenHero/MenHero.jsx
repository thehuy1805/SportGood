import React from 'react';
import './MenHero.css';
import walkVideo from '../Assets/walk.mp4';

const MenHero = () => {
    return (
        <div className="men-hero">
            <div className="hero-video-container">
                <video
                    className="hero-video"
                    src={walkVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        <span className="glitch" data-text="POWER">POWER</span>
                        <span className="glitch glitch-orange" data-text="&"> &</span>
                        <span className="glitch" data-text="PERFORMANCE"> PERFORMANCE</span>
                    </h1>
                    <p className="hero-subtitle">
                        Unleash your strength with premium athletic wear
                        <br />
                        designed for champions
                    </p>
                    <div className="hero-cta-group">
                        <a href="#products" className="hero-btn primary">Shop Collection</a>
                        <a href="#products" className="hero-btn secondary">Watch Video</a>
                    </div>
                </div>

                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-value">500+</span>
                        <span className="stat-label">Products</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">50K+</span>
                        <span className="stat-label">Athletes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">4.9</span>
                        <span className="stat-label">Rating</span>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator">
                <span>Scroll</span>
                <div className="scroll-arrow"></div>
            </div>
        </div>
    );
};

export default MenHero;
