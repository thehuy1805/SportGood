import React from 'react';
import Hero from '../Components/Hero/Hero';
import BannerNavigation from '../Components/BannerNavigation/BannerNavigation';
import Popular from '../Components/Popular/Popular';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import { Truck , ShieldCheck, Home } from 'lucide-react';
import './CSS/Shop.css';

export const Shop = () => {
  return (
    <div className="shop-wrapper">
      <Hero />
      <BannerNavigation />
      <Popular />
      <Offers />
      <NewCollections />
      <div className="video-section">
        <h2>Crossfit Trending Wear</h2>
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://player.vimeo.com/video/95380310?h=9f8101bf3a"
            
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="video-info">
        <div className="video-info-label">
          <span>Why Choose Us</span>
        </div>
        <div className="info-items">
          <div className="info-item">
            <div className="info-icon-wrap">
              <Truck size={32} />
            </div>
            <div className="info-text">
              <h3>Free Shipping</h3>
              <p>On orders over $50. Fast & reliable delivery to your doorstep.</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <div className="info-text">
              <h3>Money-Back Guarantee</h3>
              <p>Not satisfied? Return within 14 days for a full refund — no questions asked.</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon-wrap">
              <Home size={32} />
            </div>
            <div className="info-text">
              <h3>Quality Checked</h3>
              <p>Inspect your order at delivery. Pay only if you're happy with it.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Shop;
