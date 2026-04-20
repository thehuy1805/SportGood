import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { Heart, Zap } from 'lucide-react';
import './SportsItem.css';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#06b6d4" : "none"}
    stroke={filled ? "#06b6d4" : "rgba(148,163,184,0.35)"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="star-svg"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SportsItem = ({ id, name, image, new_price, old_price, feedbacks }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const { toggleWishlist, isInWishlist } = useContext(ShopContext);

  const averageRating = feedbacks && feedbacks.length > 0
    ? Math.round(feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length)
    : 0;

  const discount = old_price > new_price
    ? Math.round(((old_price - new_price) / old_price) * 100)
    : null;

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' textAnchor='middle' dy='.3em' fill='%239ca3af' fontFamily='sans-serif' fontSize='14'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
    setAddedToWishlist(true);
    setTimeout(() => setAddedToWishlist(false), 600);
  };

  return (
    <div className="sports-item-card">
      <Link
        to={`/product/${generateSlug(name)}`}
        className="sports-item-link"
        onClick={() => window.scrollTo(0, 0)}
      >
        <div className="sports-item-image-wrapper">
          <img
            src={image}
            alt={name}
            className={`sports-item-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {!imageLoaded && <div className="sports-item-skeleton" />}

          <div className="sports-item-overlay">
            <span className="sports-overlay-text">
              <Zap size={14} />
              Quick View
            </span>
          </div>

          {discount && (
            <div className="sports-discount-badge">
              -{discount}%
            </div>
          )}

          <button
            className={`sports-wishlist-btn ${inWishlist ? 'active' : ''} ${addedToWishlist ? 'animating' : ''}`}
            onClick={handleWishlistClick}
          >
            <Heart size={14} fill={inWishlist ? '#06b6d4' : 'none'} stroke={inWishlist ? '#06b6d4' : 'currentColor'} />
          </button>
        </div>

        <div className="sports-item-details">
          <h3 className="sports-item-name">{name}</h3>
          
          <div className="sports-item-bottom">
            <div className="sports-item-prices">
              <span className="sports-item-price-new">${new_price}</span>
              {old_price > new_price && (
                <span className="sports-item-price-old">${old_price}</span>
              )}
            </div>
            
            <div className="sports-item-rating">
              <div className="sports-item-stars">
                {[...Array(5)].map((_, index) => (
                  <StarIcon key={index} filled={index < averageRating} />
                ))}
              </div>
              {feedbacks && feedbacks.length > 0 && (
                <span className="sports-item-review-count">({feedbacks.length})</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SportsItem;
