import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerNavigation.css';
import gym_banner from '../Assets/gym_banner.png';
import shoes_banner from '../Assets/shoes_banner.png';
import running_banner from '../Assets/running_banner.png';
import basketball_banner from '../Assets/basketball_banner.png';
import sportwear_banner from '../Assets/sportwear_banner.png';

const categories = [
  {
    id: 1,
    image: sportwear_banner,
    category: 'Sportwear',
    desc: 'Training & Performance',
    path: '/sportswear/gym-sets',
  },
  {
    id: 2,
    image: gym_banner,
    category: 'Gym & Fitness',
    desc: 'Build Your Strength',
    path: '/sportswear/gym-sets',
  },
  {
    id: 3,
    image: shoes_banner,
    category: 'Soccer Shoes',
    desc: 'Dominate the Pitch',
    path: '/sports-shoes/soccer-shoes',
  },
  {
    id: 4,
    image: running_banner,
    category: 'Running',
    desc: 'Feel the Speed',
    path: '/sport-equipment',
  },
  {
    id: 5,
    image: basketball_banner,
    category: 'Basketball',
    desc: 'Own the Court',
    path: '/sport-equipment',
  },
];

const BannerNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="bn3-outer">
      <div className="bn3-header">
        <p className="bn3-label">Explore</p>
        <h2 className="bn3-title">Browse by Sport</h2>
      </div>
      <div className="bn3-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bn3-card"
            onClick={() => navigate(cat.path)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bn3-img-wrap">
              <img src={cat.image} alt={cat.category} className="bn3-img" />
              <div className="bn3-overlay"></div>
            </div>
            <div className="bn3-info">
              <span className="bn3-cat">{cat.category}</span>
              <span className="bn3-desc">{cat.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerNavigation;
