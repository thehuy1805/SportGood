import React from 'react';
import './WomenHero.css';

const floatingIcons = [
    { icon: '🧘', style: { top: '15%', left: '60%', animationDelay: '0s' } },
    { icon: '💪', style: { top: '25%', right: '15%', animationDelay: '0.5s' } },
    { icon: '✨', style: { bottom: '30%', left: '55%', animationDelay: '1s' } },
    { icon: '🌸', style: { bottom: '20%', right: '20%', animationDelay: '1.5s' } },
    { icon: '🏃‍♀️', style: { top: '40%', left: '70%', animationDelay: '0.3s' } },
    { icon: '🧘‍♀️', style: { top: '60%', right: '25%', animationDelay: '0.8s' } },
];

const WomenHero = () => {
    return (
        <div className="women-hero">
            <div className="hero-split">
                <div className="hero-image-side">
                    <div className="hero-image-bg"></div>
                    <div className="hero-image-overlay"></div>
                </div>

                <div className="hero-gradient-side">
                    <div className="gradient-bg"></div>
                    <div className="floating-icons-container">
                        {floatingIcons.map((item, index) => (
                            <span 
                                key={index} 
                                className="floating-icon"
                                style={item.style}
                            >
                                {item.icon}
                            </span>
                        ))}
                    </div>
                    <div className="hero-quote">
                        <span className="quote-mark">"</span>
                        <p className="quote-text">Strong is the new beautiful</p>
                        <span className="quote-mark">"</span>
                    </div>
                </div>
            </div>

            <div className="hero-content">
                <span className="hero-badge">
                    <span className="badge-dot"></span>
                    New Collection 2026
                </span>

                <h1 className="hero-title">
                    <span className="title-line">EMPOWER</span>
                    <span className="title-line">&</span>
                    <span className="title-line accent">FLOW</span>
                </h1>

                <p className="hero-description">
                    Discover our curated collection designed for the modern woman.
                    <br />
                    Where elegance meets athletic excellence.
                </p>

                <div className="hero-cta-group">
                    <a href="#products" className="hero-btn primary">Explore Now</a>
                    <a href="#products" className="hero-btn secondary">Watch Lookbook</a>
                </div>

                <div className="scroll-hint">
                    <span>Scroll to discover</span>
                    <div className="scroll-line"></div>
                </div>
            </div>
        </div>
    );
};

export default WomenHero;
