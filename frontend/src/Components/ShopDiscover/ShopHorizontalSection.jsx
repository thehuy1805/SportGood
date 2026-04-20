import React, { useState, useEffect } from 'react';
import './ShopHorizontalSection.css';
import { ChevronRight, TrendingUp, Flame, Star } from 'lucide-react';
import Item from '../Item/Item';

const sectionConfigs = {
    'best-sellers': {
        title: 'Best Sellers',
        subtitle: 'Top picks this month',
        icon: Flame,
        accent: '#f05353',
        gradient: 'linear-gradient(135deg, rgba(240,83,83,0.08), rgba(236,96,89,0.04))',
    },
    'new-arrivals': {
        title: 'New Arrivals',
        subtitle: 'Just dropped',
        icon: Star,
        accent: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
    },
    'trending': {
        title: 'Trending This Week',
        subtitle: 'Hot items right now',
        icon: TrendingUp,
        accent: '#f97316',
        gradient: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))',
    },
};

const ShopHorizontalSection = ({ type, products }) => {
    const [visible, setVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const config = sectionConfigs[type] || sectionConfigs['best-sellers'];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseDown = (e) => {
        const container = e.currentTarget;
        setIsDragging(true);
        setStartX(e.pageX - container.offsetLeft);
        setScrollLeft(container.scrollLeft);
        container.style.cursor = 'grabbing';
    };

    const handleMouseUp = (e) => {
        e.currentTarget.style.cursor = 'grab';
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const container = e.currentTarget;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const displayProducts = products?.slice(0, 8) || [];

    return (
        <div
            className={`shop-hs ${visible ? 'shop-hs-visible' : ''}`}
            style={{ '--accent': config.accent, '--section-gradient': config.gradient }}
        >
            {/* Header */}
            <div className="shop-hs-header">
                <div className="shop-hs-title-group">
                    <div className="shop-hs-icon-wrap">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h2 className="shop-hs-title">{config.title}</h2>
                        <p className="shop-hs-subtitle">{config.subtitle}</p>
                    </div>
                </div>
                <button className="shop-hs-view-all">
                    View All <ChevronRight size={15} />
                </button>
            </div>

            {/* Scroll track */}
            <div
                className="shop-hs-scroll"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="shop-hs-track">
                    {displayProducts.map((product, idx) => (
                        <div
                            key={product.id || idx}
                            className="shop-hs-item"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <Item
                                id={product.id}
                                name={product.name}
                                image={product.image}
                                new_price={product.new_price}
                                old_price={product.old_price}
                                feedbacks={product.feedbacks}
                                category={product.category}
                                generalCategory={product.generalCategory}
                                detailedCategory={product.detailedCategory}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopHorizontalSection;
export { sectionConfigs };
