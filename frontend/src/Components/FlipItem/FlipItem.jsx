import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { Heart } from 'lucide-react';
import './FlipItem.css';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#ec4899" : "none"}
    stroke={filled ? "#ec4899" : "rgba(148,163,184,0.35)"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="star-svg"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FlipItem = ({ id, name, image, new_price, old_price, feedbacks }) => {
  const [isFlipped, setIsFlipped] = useState(false);
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
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' textAnchor='middle' dy='.3em' fill='%239ca3af' fontFamily='sans-serif' fontSize='14'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
    setAddedToWishlist(true);
    setTimeout(() => setAddedToWishlist(false), 600);
  };

  const fabricDetails = [
    { label: 'Material', value: '87% Nylon, 13% Spandex' },
    { label: 'Feel', value: 'Butter Soft, 4-Way Stretch' },
    { label: 'Fit', value: 'True to Size, Relaxed' },
    { label: 'Care', value: 'Machine Wash Cold' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front">
          <Link
            to={`/product/${generateSlug(name)}`}
            className="flip-link"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="flip-image-wrapper">
              <img
                src={image}
                alt={name}
                className={`flip-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
              {!imageLoaded && <div className="flip-image-skeleton" />}

              {discount && (
                <div className="flip-discount-badge">
                  -{discount}%
                </div>
              )}

              <button
                className={`flip-wishlist-btn ${inWishlist ? 'active' : ''} ${addedToWishlist ? 'animating' : ''}`}
                onClick={handleWishlistClick}
              >
                <Heart size={14} fill={inWishlist ? '#ec4899' : 'none'} stroke={inWishlist ? '#ec4899' : 'currentColor'} />
              </button>
            </div>

            <div className="flip-details">
              <h3 className="flip-name">{name}</h3>
              <div className="flip-bottom">
                <div className="flip-prices">
                  <span className="flip-price-new">${new_price}</span>
                  {old_price > new_price && (
                    <span className="flip-price-old">${old_price}</span>
                  )}
                </div>
                <div className="flip-rating">
                  <div className="flip-stars">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon key={index} filled={index < averageRating} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Back */}
        <div className="flip-card-back">
          <div className="flip-back-content">
            <h3 className="flip-back-title">{name}</h3>
            
            <div className="flip-fabric-section">
              <span className="flip-fabric-label">Fabric Details</span>
              <div className="flip-fabric-list">
                {fabricDetails.map((detail, index) => (
                  <div key={index} className="flip-fabric-item">
                    <span className="fabric-key">{detail.label}</span>
                    <span className="fabric-value">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flip-size-section">
              <span className="flip-size-label">Available Sizes</span>
              <div className="flip-size-grid">
                {sizes.map((size) => (
                  <span key={size} className="flip-size-chip">{size}</span>
                ))}
              </div>
            </div>

            <Link
              to={`/product/${generateSlug(name)}`}
              className="flip-view-btn"
              onClick={() => window.scrollTo(0, 0)}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipItem;
