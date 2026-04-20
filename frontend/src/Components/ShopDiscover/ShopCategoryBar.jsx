import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShopCategoryBar.css';
import { ChevronRight, CircleDot, Dumbbell, Shirt, Wind, Watch, Crown, Sparkles, Zap } from 'lucide-react';

const categoryData = [
    {
        id: 'soccer',
        label: 'Soccer Jerseys',
        sublabel: 'National Teams',
        icon: CircleDot,
        gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        accent: '#00f5ff',
        route: '/sportswear/soccer-jerseys',
    },
    {
        id: 'gym',
        label: 'Gym & Training',
        sublabel: 'Performance',
        icon: Dumbbell,
        gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        accent: '#e94560',
        route: '/sportswear/gym-sets',
    },
    {
        id: 'running',
        label: 'Running',
        sublabel: 'Lightweight Gear',
        icon: Wind,
        gradient: 'linear-gradient(135deg, #134e5e, #71b280)',
        accent: '#10b981',
        route: '/sportswear/running',
    },
    {
        id: 'basketball',
        label: 'Basketball',
        sublabel: 'Court Ready',
        icon: Shirt,
        gradient: 'linear-gradient(135deg, #7b2ff7, #f72fa8)',
        accent: '#a855f7',
        route: '/sports-shoes/basketball-shoes',
    },
    {
        id: 'swimwear',
        label: 'Swimwear',
        sublabel: 'Aqua Gear',
        icon: Wind,
        gradient: 'linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)',
        accent: '#60a5fa',
        route: '/sportswear/swimwear',
    },
    {
        id: 'accessories',
        label: 'Accessories',
        sublabel: 'Gear Up',
        icon: Watch,
        gradient: 'linear-gradient(135deg, #232526, #414345)',
        accent: '#f97316',
        route: '/sports-accessories',
    },
    {
        id: 'new-arrivals',
        label: 'New Arrivals',
        sublabel: 'Just Dropped',
        icon: Sparkles,
        gradient: 'linear-gradient(135deg, #f05353, #ec6059)',
        accent: '#f97316',
        route: '/sportswear/new-arrivals',
    },
    {
        id: 'premium',
        label: 'Premium Picks',
        sublabel: 'Top Rated',
        icon: Crown,
        gradient: 'linear-gradient(135deg, #c9d225, #f5af19, #f12711)',
        accent: '#fbbf24',
        route: '/sportswear/premium',
    },
    {
        id: 'trending',
        label: 'Trending Now',
        sublabel: 'Hot Items',
        icon: Zap,
        gradient: 'linear-gradient(135deg, #f12711, #f5af19)',
        accent: '#f59e0b',
        route: '/sports-shoes/trending',
    },
    {
        id: 'lifestyle',
        label: 'Lifestyle',
        sublabel: 'Street Style',
        icon: Shirt,
        gradient: 'linear-gradient(135deg, #1a1a1a, #333333)',
        accent: '#a3a3a3',
        route: '/sportswear/lifestyle',
    },
];

const ShopCategoryBar = () => {
    const [visible, setVisible] = useState(false);
    const [activeCard, setActiveCard] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseDown = (e) => {
        const scrollContainer = e.currentTarget;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainer.offsetLeft);
        setScrollLeft(scrollContainer.scrollLeft);
        scrollContainer.style.cursor = 'grabbing';
    };

    const handleMouseUp = (e) => {
        const scrollContainer = e.currentTarget;
        setIsDragging(false);
        scrollContainer.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const scrollContainer = e.currentTarget;
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainer.scrollLeft = scrollLeft - walk;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleCardClick = (cat) => {
        navigate(cat.route);
    };

    return (
        <div className={`shop-cat-bar ${visible ? 'shop-cat-bar-visible' : ''}`}>
            <div className="shop-cat-bar-header">
                <h2 className="shop-cat-title">Shop by Category</h2>
                <div className="shop-cat-line" />
            </div>

            {/* Horizontal scroll container */}
            <div
                className="shop-cat-scroll"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="shop-cat-track">
                    {categoryData.map((cat, idx) => {
                        const IconComponent = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                className={`shop-cat-card ${activeCard === idx ? 'card-active' : ''}`}
                                style={{ '--accent': cat.accent, '--gradient': cat.gradient }}
                                onMouseEnter={() => setActiveCard(idx)}
                                onMouseLeave={() => setActiveCard(null)}
                                onClick={() => handleCardClick(cat)}
                            >
                                <div className="cat-card-bg" />
                                <div className="cat-card-icon">
                                    <IconComponent size={28} strokeWidth={1.5} />
                                </div>
                                <div className="cat-card-info">
                                    <span className="cat-card-label">{cat.label}</span>
                                    <span className="cat-card-sub">{cat.sublabel}</span>
                                </div>
                                <div className="cat-card-arrow">
                                    <ChevronRight size={14} />
                                </div>
                                <div className="cat-card-glow" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShopCategoryBar;
