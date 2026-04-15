import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import './CartItems.css';

const CartItems = () => {
    const {
        getTotalCartAmount,
        all_product,
        removeFromCart,
        addToCart,
        cart,
        clearCart,
    } = useContext(ShopContext);

    const navigate = useNavigate();
    const [totalAmount, setTotalAmount] = useState(0);
    const [soldOutItems, setSoldOutItems] = useState({});
    const shippingCost = totalAmount >= 100 ? 0 : 15;

    useEffect(() => {
        const checkSoldOutItems = () => {
            const newSoldOutItems = {};

            Object.keys(cart).forEach(productId => {
                const product = all_product.find(e => e.id === parseInt(productId));
                if (!product) return;

                Object.keys(cart[productId]).forEach(size => {
                    const sizeStatusMap = product.sizeStatus || {};
                    const raw = sizeStatusMap[size] || sizeStatusMap['__se__'] || {};

                    let status = 'available';
                    let remainingQty = null;
                    if (typeof raw === 'object') {
                        status = raw.status || 'available';
                        remainingQty = raw.remainingQuantity ?? null;
                    }

                    if (product.generalCategory === 'Sports Equipment') {
                        if (status === 'out_of_stock' || (status === 'low_stock' && remainingQty !== null && remainingQty <= 0)) {
                            newSoldOutItems[`${productId}-${size}`] = true;
                        }
                    } else {
                        if (status === 'out_of_stock') {
                            newSoldOutItems[`${productId}-${size}`] = true;
                        }
                    }
                });
            });

            setSoldOutItems(newSoldOutItems);
        };

        checkSoldOutItems();
        setTotalAmount(getTotalCartAmount());
    }, [cart, all_product, getTotalCartAmount]);

    const isItemSoldOut = (productId, size) => {
        return soldOutItems[`${productId}-${size}`] === true;
    };

    const removeSoldOutItems = () => {
        Object.keys(soldOutItems).forEach(key => {
            const [productId, size] = key.split('-');
            removeFromCart(parseInt(productId), size);
        });
    };

    const getMaxQuantity = (product, size) => {
        const sizeStatusMap = product.sizeStatus || {};
        const raw = sizeStatusMap[size] || sizeStatusMap['__se__'] || {};
        let status = 'available';
        let remainingQty = null;
        if (typeof raw === 'object') {
            status = raw.status || 'available';
            remainingQty = raw.remainingQuantity ?? null;
        }

        if (product.generalCategory === 'Sports Equipment') {
            if (status === 'low_stock' && remainingQty !== null) return remainingQty;
            return product.stock || 0;
        }
        // Clothes / Shoes: unlimited unless low_stock
        if (status === 'low_stock' && remainingQty !== null) return remainingQty;
        return null;
    };

    const handleCheckout = () => {
        const hasSoldOutItems = Object.keys(soldOutItems).length > 0;
        if (hasSoldOutItems) return;
        navigate('/checkout');
    };

    const cartCount = Object.keys(cart).reduce((acc, pid) => {
        return acc + Object.values(cart[pid]).reduce((a, q) => a + q, 0);
    }, 0);

    return (
        <div className='cart-page'>
            <div className='cart-page-inner'>
                {Object.keys(cart).length > 0 ? (
                    <div className='cart-layout'>
                        {/* Left: Cart items */}
                        <div className="cart-items-col">
                            <div className="cart-header">
                                <div className="cart-header-left">
                                    <h1 className="cart-title">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                        Your Cart
                                    </h1>
                                    <span className="cart-count-badge">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                                </div>
                                {Object.keys(cart).length > 0 && (
                                    <button
                                        className="clear-cart-btn"
                                        onClick={clearCart}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                        </svg>
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {Object.keys(soldOutItems).length > 0 && (
                                <div className="sold-out-alert">
                                    <div className="sold-out-alert-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                            <line x1="12" y1="9" x2="12" y2="13"></line>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                    </div>
                                    <div className="sold-out-alert-text">
                                        <span className="sold-out-alert-title">{Object.keys(soldOutItems).length} item(s) unavailable</span>
                                        <span className="sold-out-alert-sub">Stock is lower than requested</span>
                                    </div>
                                    <button
                                        className="remove-sold-out-btn"
                                        onClick={removeSoldOutItems}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <div className="cart-items-list">
                                {Object.keys(cart).map((productId) => {
                                    const product = all_product.find(e => e.id === parseInt(productId));
                                    if (!product) return null;
                                    return Object.keys(cart[productId]).map((size) => {
                                        const quantity = cart[productId][size];
                                        if (quantity <= 0) return null;
                                        const isSoldOut = isItemSoldOut(productId, size);
                                        const maxQty = getMaxQuantity(product, size);
                                        const itemTotal = product.new_price * quantity;

                                        return (
                                            <div
                                                key={`${productId}-${size}`}
                                                className={`cart-row ${isSoldOut ? 'sold-out' : ''}`}
                                            >
                                                {isSoldOut && (
                                                    <div className="sold-out-ribbon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                                        </svg>
                                                        Sold Out
                                                    </div>
                                                )}

                                                <div className="cart-row-image">
                                                    <img src={product.image} alt={product.name} />
                                                </div>

                                                <div className="cart-row-info">
                                                    <h3 className="cart-row-name">{product.name}</h3>
                                                    <div className="cart-row-meta">
                                                        <span className="cart-row-size">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                            </svg>
                                                            Size: {size}
                                                        </span>
                                                        <span className="cart-row-unit-price">${product.new_price} / item</span>
                                                    </div>
                                                </div>

                                                <div className="cart-row-qty">
                                                    <div className={`qty-control ${isSoldOut ? 'disabled' : ''}`}>
                                                        <button
                                                            onClick={() => removeFromCart(product.id, size)}
                                                            className="qty-btn qty-minus"
                                                            disabled={isSoldOut}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                            </svg>
                                                        </button>
                                                        <span className="qty-value">{quantity}</span>
                                                <button
                                                    onClick={() => addToCart(product.id, size)}
                                                    className="qty-btn qty-plus"
                                                    disabled={isSoldOut || (maxQty !== null && quantity >= maxQty)}
                                                >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    {maxQty !== null && quantity >= maxQty && !isSoldOut && (
                                                        <span className="max-stock-hint">Max: {maxQty}</span>
                                                    )}
                                                </div>

                                                <div className="cart-row-total">
                                                    <span className="cart-row-total-label">Subtotal</span>
                                                    <span className="cart-row-total-value">${itemTotal.toFixed(2)}</span>
                                                </div>

                                                <button
                                                    className="cart-row-remove"
                                                    onClick={() => removeFromCart(product.id, size)}
                                                    title="Remove item"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    });
                                })}
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="cart-summary-col">
                            <div className="cart-summary">
                                <h2 className="summary-title">Order Summary</h2>

                                <div className="summary-divider" />

                                <div className="summary-details">
                                    <div className="summary-row">
                                        <span className="summary-label">Items ({cartCount})</span>
                                        <span className="summary-value">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="summary-label">
                                            Shipping
                                            {shippingCost === 0 && (
                                                <span className="summary-label-hint">Free</span>
                                            )}
                                        </span>
                                        <span className={`summary-value ${shippingCost === 0 ? 'summary-free' : ''}`}>
                                            {shippingCost === 0 ? '$0.00' : `$${shippingCost.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="summary-label">Tax</span>
                                        <span className="summary-value">$0.00</span>
                                    </div>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-total-row">
                                    <span className="summary-total-label">Total</span>
                                    <span className="summary-total-value">${(totalAmount + shippingCost).toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className={`checkout-btn ${Object.keys(soldOutItems).length > 0 ? 'checkout-disabled' : ''}`}
                                    disabled={Object.keys(soldOutItems).length > 0}
                                >
                                    {Object.keys(soldOutItems).length > 0 ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                            </svg>
                                            Unavailable Items
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Checkout
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <div className="summary-perks">
                                    <div className="perk-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="3" width="15" height="13"></rect>
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                        </svg>
                                        Free Delivery
                                    </div>
                                    <div className="perk-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        </svg>
                                        Secure Checkout
                                    </div>
                                    <div className="perk-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 4 23 10 17 10"></polyline>
                                            <polyline points="1 20 1 14 7 14"></polyline>
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                        </svg>
                                        14-Day Returns
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                        <h2 className="empty-cart-title">Your Cart is Empty</h2>
                        <p className="empty-cart-desc">Looks like you haven't added anything to your cart yet. Let's find something you'll love.</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="shop-now-btn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartItems;
