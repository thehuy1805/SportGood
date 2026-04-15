import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import './WishlistPage.css';

const generateSlug = (name) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist, addToCart, isLoggedIn, all_product } = useContext(ShopContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState({});

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        const fetchWishlistProducts = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await fetch(`${API_BASE_URL}/wishlist/full`, {
                    headers: { 'auth-token': token }
                });
                const data = await res.json();
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Error fetching wishlist products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [isLoggedIn, wishlist]);

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            if (window.confirm('Please log in to add products to your wishlist!')) {
                navigate('/login');
            }
            return;
        }

        const effectiveSize = product.generalCategory === 'Sports Equipment' ? 'default' : null;
        if (effectiveSize === null && product.generalCategory !== 'Sports Equipment') {
            toast.warn('Please select a size before adding to cart.');
            return;
        }

        addToCart(product.id, effectiveSize);
        setAddedToCart(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedToCart(prev => ({ ...prev, [product.id]: false }));
        }, 2000);
    };

    const handleRemove = (e, productId) => {
        e.stopPropagation();
        toggleWishlist(productId);
    };

    const handleProductClick = (product) => {
        navigate(`/product/${generateSlug(product.name)}`);
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    if (!isLoggedIn) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-container">
                    <div className="wishlist-empty">
                        <div className="wishlist-empty-icon">
                            <Heart size={64} strokeWidth={1.5} />
                        </div>
                        <h2>Please log in to view your wishlist</h2>
                        <p>Save your favorite products by adding them to your wishlist</p>
                        <button className="wishlist-btn-primary" onClick={() => navigate('/login')}>
                            Login / Register
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">
                <div className="wishlist-header">
                    <div className="wishlist-header-left">
                        <button className="wishlist-back-btn" onClick={handleContinueShopping}>
                            <ArrowLeft size={20} />
                        </button>
                        <div className="wishlist-title-group">
                            <Heart size={28} className="wishlist-title-icon" />
                            <h1 className="wishlist-title">My Wishlist</h1>
                            <span className="wishlist-count">({products.length} {products.length === 1 ? 'product' : 'products'})</span>
                        </div>
                    </div>
                    {products.length > 0 && (
                        <button
                            className="wishlist-clear-btn"
                            onClick={async () => {
                                const token = localStorage.getItem('auth-token');
                                await fetch(`${API_BASE_URL}/wishlist/clear`, {
                                    method: 'DELETE',
                                    headers: { 'auth-token': token }
                                });
                                products.forEach(p => toggleWishlist(p.id));
                            }}
                        >
                            <Trash2 size={16} />
                            Clear all
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="wishlist-loading">
                        <div className="wishlist-spinner"></div>
                        <p>Loading wishlist...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="wishlist-empty">
                        <div className="wishlist-empty-icon">
                            <Heart size={64} strokeWidth={1.5} />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Start adding products you love to your wishlist</p>
                        <button className="wishlist-btn-primary" onClick={handleContinueShopping}>
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {products.map((product) => {
                            const discount = product.old_price > product.new_price
                                ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
                                : null;

                            return (
                                <div
                                    key={product.id}
                                    className="wishlist-card"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="wishlist-card-image">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' textAnchor='middle' dy='.3em' fill='%2394a3b8' fontFamily='sans-serif' fontSize='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                        {discount && (
                                            <div className="wishlist-card-discount">-{discount}%</div>
                                        )}
                                        <button
                                            className="wishlist-card-remove"
                                            onClick={(e) => handleRemove(e, product.id)}
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="wishlist-card-details">
                                        <span className="wishlist-card-category">
                                            {product.generalCategory} / {product.detailedCategory}
                                        </span>
                                        <h3 className="wishlist-card-name">{product.name}</h3>
                                        <div className="wishlist-card-bottom">
                                            <div className="wishlist-card-price">
                                                <span className="wishlist-card-price-new">${product.new_price}</span>
                                                {product.old_price > product.new_price && (
                                                    <span className="wishlist-card-price-old">${product.old_price}</span>
                                                )}
                                            </div>
                                            <button
                                                className={`wishlist-card-cart ${addedToCart[product.id] ? 'added' : ''}`}
                                                onClick={(e) => handleAddToCart(e, product)}
                                            >
                                                {addedToCart[product.id] ? (
                                                    <>
                                                        <ShoppingCart size={16} />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={16} />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
