import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProductDisplay.css';
import { ShopContext } from '../../Context/ShopContext';
import useProductStore from '../../store/productStore';
import { ShoppingCart, ChevronRight, Package, ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

const SHOE_CATEGORIES = ['Soccer Shoes', 'Basketball Shoes'];

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill={filled ? "#f97316" : "none"} stroke={filled ? "#f97316" : "rgba(148,163,184,0.35)"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const STATUS_LABEL = {
  available: 'available',
  low_stock: 'low_stock',
  out_of_stock: 'out_of_stock',
};

const ProductDisplay = ({ product, feedbacks }) => {
  const { addToCart, isLoggedIn, toggleWishlist, isInWishlist } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mainImage, setMainImage] = useState(product ? product.image : '');
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);
  const setSelectedProduct = useProductStore(state => state.setSelectedProduct);

  const inWishlist = isInWishlist(product?.id);

  useEffect(() => {
    if (product) setSelectedProduct(product);
  }, [product, setSelectedProduct]);

  useEffect(() => {
    if (product) setMainImage(product.image);
  }, [product]);

  const isShoe = SHOE_CATEGORIES.includes(product?.detailedCategory);
  const isClothes = product?.generalCategory === 'Men' || product?.generalCategory === 'Women';
  const isSports = product?.generalCategory === 'Sports Equipment';

  const sizes = isShoe ? ['39', '40', '41', '42', '43'] : isClothes ? ['S', 'M', 'L', 'XL', 'XXL'] : [];
  const sizeStatusMap = product?.sizeStatus || {};

  const getSizeEntry = (size) => {
    return sizeStatusMap[size] || { status: 'available', remainingQuantity: null };
  };

  const getSeEntry = () => {
    return sizeStatusMap['__se__'] || { status: 'available', remainingQuantity: null };
  };

  const isSizeDisabled = (size) => {
    const entry = getSizeEntry(size);
    return entry.status === 'out_of_stock';
  };

  const handleSizeClick = (size) => {
    if (!isSizeDisabled(size)) {
      setSelectedSize(selectedSize === size ? null : size);
    }
  };

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            if (window.confirm('You need to login to add products to cart!!')) {
                localStorage.setItem('returnAfterLogin', location.pathname);
                navigate('/login');
            }
            return;
        }

        if (!isSports && !selectedSize) {
            alert('Vui lòng chọn size trước khi thêm vào giỏ hàng.');
            return;
        }

        const size = isSports ? 'default' : selectedSize;
        addToCart(product.id, size);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleAddToWishlist = (e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            if (window.confirm('You need to login to add products to wishlist!!')) {
                localStorage.setItem('returnAfterLogin', location.pathname);
                navigate('/login');
            }
            return;
        }
        toggleWishlist(product.id);
        setWishlistAnimating(true);
        setTimeout(() => setWishlistAnimating(false), 600);
    };

  const isAddToCartDisabled = () => {
    if (isSports) {
      const se = getSeEntry();
      if (se.status === 'out_of_stock') return true;
      if (se.status === 'low_stock') return se.remainingQuantity <= 0;
      return product.stock <= 0;
    }
    return !selectedSize;
  };

  const renderStockInformation = () => {
    if (isSports) {
      const se = getSeEntry();
      if (se.status === 'low_stock') {
        return (
          <div className="pd-stock-badge pd-stock-low">
            <Package size={14} />
            <span>Few left — <strong>{se.remainingQuantity}</strong> remaining</span>
          </div>
        );
      }
      if (se.status === 'out_of_stock') {
        return (
          <div className="pd-stock-badge pd-stock-oos">
            <Package size={14} />
            <span>Out of stock</span>
          </div>
        );
      }
      return (
        <div className="pd-stock-badge">
          <Package size={14} />
          <span>In stock: <strong>{product.stock}</strong></span>
        </div>
      );
    }
    return null;
  };

  if (!product) {
    return <div className="pd-loading">Loading product...</div>;
  }

  const discount = product.old_price > 0
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
    : 0;

  const averageRating = feedbacks && feedbacks.length > 0
    ? Math.round(feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length)
    : 0;

  return (
    <div className="pd-wrapper">
      <div className="pd-container">
        {/* LEFT: Image Gallery */}
        <div className="pd-gallery">
          <div className="pd-thumbnails">
            <div
              className={`pd-thumb ${mainImage === product.image ? 'pd-thumb-active' : ''}`}
              onClick={() => setMainImage(product.image)}
            >
              <img src={product.image} alt="" />
            </div>
            {product.additionalImages?.map((img, index) => (
              <div
                key={index}
                className={`pd-thumb ${mainImage === img ? 'pd-thumb-active' : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt="" />
              </div>
            ))}
          </div>
          <div className="pd-main-image-wrap">
            {discount > 0 && (
              <div className="pd-discount-tag">-{discount}%</div>
            )}
            <img className="pd-main-img" src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="pd-info">
          <div className="pd-breadcrumb">
            <span>Shop</span>
            <ChevronRight size={12} />
            <span>{product.generalCategory}</span>
            <ChevronRight size={12} />
            <span>{product.detailedCategory}</span>
          </div>

          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating">
            {feedbacks && feedbacks.length > 0 ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <StarIcon key={index} filled={index < averageRating} />
                ))}
                <span className="pd-rating-count">({feedbacks.length} reviews)</span>
              </>
            ) : (
              <p className="pd-no-rating">Be the first to review this product</p>
            )}
          </div>

          <div className="pd-pricing">
            <span className="pd-price-new">${product.new_price}</span>
            {product.old_price > 0 && (
              <span className="pd-price-old">${product.old_price}</span>
            )}
          </div>

          <div className="pd-description">
            <p>{product.description}</p>
          </div>

          {renderStockInformation()}

          {sizes.length > 0 && (
            <div className="pd-size-section">
              <div className="pd-size-header">
                <span className="pd-size-label">Select Size</span>
                <a href="/size-guide" className="pd-size-guide-link">Size guide</a>
              </div>
              <div className="pd-sizes">
                {sizes.map((size, index) => {
                  const entry = getSizeEntry(size);
                  const isSelected = selectedSize === size;
                  const isOos = entry.status === 'out_of_stock';
                  const isLow = entry.status === 'low_stock';

                  return (
                    <div
                      key={index}
                      className={[
                        'pd-size-chip',
                        isSelected ? 'pd-size-selected' : '',
                        isOos ? 'pd-size-oos' : '',
                        isLow ? 'pd-size-low' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleSizeClick(size)}
                    >
                      <span>{size}</span>
                      {isOos && <span className="pd-size-stock">Out Of Stock</span>}
                      {isLow && entry.remainingQuantity != null && (
                        <span className="pd-size-stock">{entry.remainingQuantity} left</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pd-actions">
            <button
              className={`pd-btn-cart ${addedToCart ? 'pd-btn-added' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled()}
            >
              <ShoppingCart size={18} />
              <span>{addedToCart ? 'Added!' : 'Add to Cart'}</span>
            </button>
            <button
              className={`pd-btn-wishlist ${inWishlist ? 'pd-btn-wishlist-active' : ''} ${wishlistAnimating ? 'animating' : ''}`}
              onClick={handleAddToWishlist}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={inWishlist ? '#f97316' : 'none'} stroke={inWishlist ? '#f97316' : 'currentColor'} />
            </button>
          </div>

          <p className="pd-category">
            <span>Category</span>
            <a href="/size-guide" className="pd-category-link">{product.generalCategory}</a>
            {' / '}
            <a href="/size-guide" className="pd-category-link">{product.detailedCategory}</a>
          </p>

          <div className="pd-trust-badges">
            <div className="pd-badge">
              <Truck size={15} />
              <span>Free Shipping</span>
            </div>
            <div className="pd-badge">
              <ShieldCheck size={15} />
              <span>Secure Payment</span>
            </div>
            <div className="pd-badge">
              <RotateCcw size={15} />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
