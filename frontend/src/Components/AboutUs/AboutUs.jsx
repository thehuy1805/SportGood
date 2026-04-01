import React from 'react';
import './AboutUs.css';
import { FaTrophy, FaUsers, FaShippingFast, FaHeadset } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-hero">
        <h1>About Sport Stores</h1>
        <p>Your Trusted Partner in Sports Excellence Since 2024</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>Our Story</h2>
          <p>Founded in 2024, Sport Stores has grown from a small local shop to become one of the leading sports good retailers in the region. Our passion for sports and commitment to quality has helped countless athletes and fitness enthusiasts achieve their goals.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <FaTrophy className="feature-icon" />
            <h3>Quality Products</h3>
            <p>We partner with top sports brands to bring you the highest quality equipment</p>
          </div>
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Expert Staff</h3>
            <p>Our team of sports enthusiasts provides knowledgeable advice for all your needs</p>
          </div>
          <div className="feature-card">
            <FaShippingFast className="feature-icon" />
            <h3>Fast Delivery</h3>
            <p>Quick and reliable shipping to get your equipment to you when you need it</p>
          </div>
          <div className="feature-card">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>Always here to help with your questions and concerns</p>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>We strive to provide premium sports equipment and exceptional customer service to help our customers achieve their athletic goals. Whether you're a professional athlete or just starting your fitness journey, we're here to support you every step of the way.</p>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h3>10,000+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3>1,000+</h3>
            <p>Products</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Brands</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;