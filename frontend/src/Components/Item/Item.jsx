import React, { useState } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#f97316" : "none"}
    stroke={filled ? "#f97316" : "rgba(148,163,184,0.35)"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="star-svg"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Item = (props) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const averageRating = props.feedbacks && props.feedbacks.length > 0
    ? Math.round(props.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / props.feedbacks.length)
    : 0;

  const discount = props.old_price > props.new_price
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : null;

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' textAnchor='middle' dy='.3em' fill='%2394a3b8' fontFamily='sans-serif' fontSize='14'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="item-card">
      <Link
        to={`/product/${generateSlug(props.name)}`}
        className="item-link"
        onClick={() => window.scrollTo(0, 0)}
      >
        {/* Image area */}
        <div className="item-image-wrapper">
          <img
            src={props.image}
            alt={props.name}
            className={`item-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />

          {/* Skeleton loader */}
          {!imageLoaded && <div className="item-image-skeleton" />}

          {/* Hover overlay */}
          <div className="item-overlay">
            <span className="item-overlay-text">View Details</span>
            <span className="item-overlay-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          </div>

          {/* Discount badge */}
          {discount && (
            <div className="item-discount-badge">
              <span className="item-discount-value">-{discount}%</span>
            </div>
          )}
        </div>

        {/* Details area */}
        <div className="item-details">
          <h3 className="item-name">{props.name}</h3>

          <div className="item-bottom">
            {/* Pricing */}
            <div className="item-prices">
              <span className="item-price-new">${props.new_price}</span>
              {props.old_price > props.new_price && (
                <span className="item-price-old">${props.old_price}</span>
              )}
            </div>

            {/* Rating */}
            <div className="item-rating">
              <div className="item-stars">
                {[...Array(5)].map((_, index) => (
                  <StarIcon key={index} filled={index < averageRating} />
                ))}
              </div>
              {props.feedbacks && props.feedbacks.length > 0 && (
                <span className="item-review-count">({props.feedbacks.length})</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Item;
