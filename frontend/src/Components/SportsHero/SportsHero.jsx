import React from 'react';
import './SportsHero.css';

const floatingObjects = [
    { type: 'dumbbell', style: { top: '15%', left: '10%', size: 80 } },
    { type: 'weight', style: { top: '25%', right: '15%', size: 60 } },
    { type: 'glove', style: { bottom: '20%', left: '15%', size: 50 } },
    { type: 'band', style: { bottom: '30%', right: '10%', size: 70 } },
    { type: 'bottle', style: { top: '50%', left: '5%', size: 45 } },
    { type: 'shaker', style: { top: '40%', right: '5%', size: 55 } },
];

const SportsHero = () => {
    return (
        <div className="sports-hero">
            <div className="hero-gradient-bg">
                <div className="gradient-layer layer-1"></div>
                <div className="gradient-layer layer-2"></div>
                <div className="gradient-layer layer-3"></div>
            </div>

            <div className="floating-objects">
                {floatingObjects.map((obj, index) => (
                    <div 
                        key={index} 
                        className={`floating-object obj-${index}`}
                        style={obj.style}
                    >
                        <FloatingIcon type={obj.type} size={obj.style.size} />
                    </div>
                ))}
            </div>

            <div className="hero-content">
                <div className="content-inner">
                    <div className="hero-label">
                        <span className="label-line"></span>
                        <span className="label-text">ENERGY HUB</span>
                        <span className="label-line"></span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-word">WORKOUT</span>
                        <span className="title-word accent">GYM</span>
                    </h1>

                    <p className="hero-slogan">
                        <span className="slogan-text">Push Your Limits</span>
                        <span className="slogan-divider">•</span>
                        <span className="slogan-text">Break Boundaries</span>
                        <span className="slogan-divider">•</span>
                        <span className="slogan-text">Own Your Strength</span>
                    </p>

                    <div className="hero-cta">
                        <a href="#products" className="cta-btn primary">
                            <span className="btn-text">Start Your Challenge</span>
                            <span className="btn-icon">→</span>
                        </a>
                        <a href="#products" className="cta-btn secondary">
                            Browse Equipment
                        </a>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-num">200+</span>
                            <span className="stat-label">Equipment</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-num">50K+</span>
                            <span className="stat-label">Athletes</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-num">24/7</span>
                            <span className="stat-label">Support</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-wave">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,90 1440,60 L1440,120 L0,120 Z" fill="#0a0a14"/>
                </svg>
            </div>
        </div>
    );
};

const FloatingIcon = ({ type, size }) => {
    const icons = {
        dumbbell: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <rect x="8" y="26" width="12" height="12" rx="2" fill="#a855f7"/>
                <rect x="44" y="26" width="12" height="12" rx="2" fill="#a855f7"/>
                <rect x="18" y="28" width="28" height="8" rx="2" fill="#c084fc"/>
                <circle cx="10" cy="32" r="4" fill="#7c3aed"/>
                <circle cx="54" cy="32" r="4" fill="#7c3aed"/>
            </svg>
        ),
        weight: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <rect x="10" y="24" width="44" height="16" rx="3" fill="#c084fc"/>
                <rect x="6" y="20" width="8" height="24" rx="2" fill="#a855f7"/>
                <rect x="50" y="20" width="8" height="24" rx="2" fill="#a855f7"/>
            </svg>
        ),
        glove: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <path d="M20 56V30C20 26 24 24 28 24V56H20Z" fill="#06b6d4"/>
                <path d="M28 56V24C32 24 36 26 36 30V56H28Z" fill="#22d3ee"/>
                <path d="M36 56V28C40 28 44 30 44 34V56H36Z" fill="#67e8f9"/>
                <path d="M16 30V22C16 18 20 16 24 16V28" stroke="#0891b2" strokeWidth="3"/>
                <path d="M44 34V24C44 20 48 18 52 18V32" stroke="#0891b2" strokeWidth="3"/>
            </svg>
        ),
        band: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <ellipse cx="32" cy="32" rx="24" ry="8" stroke="#f43f5e" strokeWidth="6" fill="none"/>
                <ellipse cx="32" cy="32" rx="16" ry="5" stroke="#fb7185" strokeWidth="4" fill="none"/>
            </svg>
        ),
        bottle: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <rect x="24" y="8" width="16" height="8" rx="2" fill="#22c55e"/>
                <rect x="22" y="14" width="20" height="42" rx="4" fill="#4ade80"/>
                <rect x="26" y="18" width="12" height="20" rx="2" fill="#86efac" opacity="0.5"/>
                <text x="32" y="52" fontSize="10" fill="#166534" textAnchor="middle" fontWeight="bold">H2O</text>
            </svg>
        ),
        shaker: (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <rect x="20" y="12" width="24" height="44" rx="6" fill="#a855f7"/>
                <rect x="22" y="14" width="20" height="16" rx="4" fill="#22d3ee" opacity="0.6"/>
                <rect x="26" y="6" width="12" height="8" rx="2" fill="#7c3aed"/>
                <circle cx="32" cy="36" r="6" fill="#c084fc"/>
            </svg>
        ),
    };

    return icons[type] || null;
};

export default SportsHero;
