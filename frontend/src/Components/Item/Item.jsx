import React, { useState, useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

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

const SHOE_CATEGORIES = ['Soccer Shoes', 'Basketball Shoes'];

const Item = (props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [hoveredSize, setHoveredSize] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSizes, setAddedSizes] = useState({});
  const { toggleWishlist, isInWishlist, addToCart } = useContext(ShopContext);

  // Dynamic sizes based on product category
  const isShoe = SHOE_CATEGORIES.includes(props.detailedCategory);
  const isClothes = props.generalCategory === 'Men' || props.generalCategory === 'Women';
  const isSports = props.generalCategory === 'Sports Equipment';
  const availableSizes = isShoe ? ['39', '40', '41', '42', '43'] : isClothes ? ['S', 'M', 'L', 'XL', 'XXL'] : [];

  const getSizeStatus = (size) => {
    const sizeStatusMap = props.sizeStatus || {};
    return sizeStatusMap[size] || { status: 'available' };
  };

  const getSeStatus = () => {
    const sizeStatusMap = props.sizeStatus || {};
    return sizeStatusMap['__se__'] || { status: 'available' };
  };

  const averageRating = props.feedbacks && props.feedbacks.length > 0
    ? Math.round(props.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / props.feedbacks.length)
    : 0;

  const discount = props.old_price > props.new_price
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : null;

  const isNew = (props.id || 0) > 1000; // Products with high IDs are "new"
  const isTrending = averageRating >= 4; // High rated = trending
  const isHot = discount && discount >= 20; // 20%+ discount = hot deal

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' textAnchor='middle' dy='.3em' fill='%2394a3b8' fontFamily='sans-serif' fontSize='14'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  const inWishlist = isInWishlist(props.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(props.id);
    setAddedToWishlist(true);
    setTimeout(() => setAddedToWishlist(false), 600);
  };

  const handleQuickAddToCart = (e, size) => {
    e.preventDefault();
    e.stopPropagation();

    // Block out-of-stock sizes
    if (!isSports) {
      const entry = getSizeStatus(size);
      if (entry.status === 'out_of_stock') return;
    } else {
      const se = getSeStatus();
      if (se.status === 'out_of_stock') return;
    }

    setIsAddingToCart(true);
    setAddedSizes((prev) => ({ ...prev, [size]: true }));

    try {
      addToCart(props.id, size);
      toast.success(`Added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }

    setTimeout(() => {
      setIsAddingToCart(false);
      setAddedSizes((prev) => ({ ...prev, [size]: false }));
    }, 1500);
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

          {/* Badges row */}
          <div className="item-badges">
            {isHot && (
              <div className="item-badge item-badge-hot">
                <span className="badge-dot" />
                -{discount}%
              </div>
            )}
            {isNew && !isHot && (
              <div className="item-badge item-badge-new">
                <span className="badge-dot" />
                NEW
              </div>
            )}
            {isTrending && !isHot && !isNew && (
              <div className="item-badge item-badge-trending">
                <span className="badge-dot" />
                TRENDING
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            className={`item-wishlist-btn ${inWishlist ? 'active' : ''} ${addedToWishlist ? 'animating' : ''}`}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={inWishlist ? '#f97316' : 'none'} stroke={inWishlist ? '#f97316' : 'currentColor'} />
          </button>

          {/* Quick Add to Cart */}
          <div className="item-quick-add">
            <div className="item-quick-add-label">
              <ShoppingBag size={13} />
              <span>Quick Add</span>
            </div>
            <div className="item-size-selector">
              {availableSizes.map((size) => {
                const entry = getSizeStatus(size);
                const isOos = entry.status === 'out_of_stock';
                return (
                  <button
                    key={size}
                    className={`size-btn ${hoveredSize === size ? 'hovered' : ''} ${addedSizes[size] ? 'added' : ''} ${isOos ? 'oos' : ''}`}
                    onClick={(e) => handleQuickAddToCart(e, size)}
                    onMouseEnter={() => setHoveredSize(size)}
                    onMouseLeave={() => setHoveredSize(null)}
                    title={isOos ? `${size} - Out of Stock` : `Add ${size} to cart`}
                  >
                    {addedSizes[size] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      size
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details area */}
        <div className="item-details">
          <h3 className="item-name">{props.name}</h3>

          {/* Category tag */}
          {props.detailedCategory && (
            <span className="item-category-tag">{props.detailedCategory}</span>
          )}

          <div className="item-bottom">
            {/* Pricing */}
            <div className="item-prices">
              <span className="item-price-new">${props.new_price}</span>
              {props.old_price > props.new_price && (
                <span className="item-price-old">${props.old_price}</span>
              )}
              {discount && (
                <span className="item-price-save">Save ${props.old_price - props.new_price}</span>
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
