import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import banner1 from '../Assets/banner1_hero.png';
import gym_banner from '../Assets/gym_banner.png';
import sportwear_banner from '../Assets/sportwear_banner.png';
import shoes_banner from '../Assets/shoes_banner.png';
import basketball_banner from '../Assets/basketball_banner.png';

const categoryCards = [
  { id: 1, image: sportwear_banner, label: 'Sportwear', tag: 'New Arrivals' },
  { id: 2, image: gym_banner, label: 'Gym & Fitness', tag: 'Hot Items' },
  { id: 3, image: shoes_banner, label: 'Soccer Shoes', tag: 'Best Seller' },
  { id: 4, image: basketball_banner, label: 'Basketball', tag: 'Trending' },
];

const Hero = () => {
  const [visible, setVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExplore = (category) => {
    navigate(`/shop`);
  };

  const handleShopNowClick = () => {
    navigate('/shop');
  };

  return (
    <div className={`hero-container ${visible ? 'hero-visible' : ''}`}>
      {/* Left Section – Hero Content */}
      <div className="hero-left">
        <div className="hero-badge">🔥 Big Sale — Up to 50% Off</div>
        <h1 className="hero-title">
          Gear Up.<br />
          <span className="hero-title-accent">Play Hard.</span><br />
          Stay Active.
        </h1>
        <p className="hero-desc">
          Discover premium sportswear, gym equipment, and athletic gear
          curated for peak performance. Your passion deserves the best.
        </p>
        <div className="hero-actions">
          <button className="hero-btn hero-btn-primary" onClick={handleShopNowClick}>
            Shop Now
          </button>
          <button className="hero-btn hero-btn-secondary" onClick={() => navigate('/shop')}>
            Explore Collections
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
      </div>

      {/* Right Section – Featured Product Cards */}
      <div className="hero-right">
        <div className="hero-featured-label">
          <span>Featured Categories</span>
          <div className="label-line"></div>
        </div>
        <div className="category-grid">
          {categoryCards.map((card) => (
            <div
              key={card.id}
              className={`category-card ${activeCard === card.id ? 'card-active' : ''}`}
              onMouseEnter={() => setActiveCard(card.id)}
              onMouseLeave={() => setActiveCard(null)}
              onClick={() => handleExplore(card.label)}
            >
              <div className="card-image-wrapper">
                <img src={card.image} alt={card.label} className="card-image" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-info">
                <span className="card-tag">{card.tag}</span>
                <span className="card-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
