import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/OrderHistoryPage.css';
import API_BASE_URL from '../config';

const OrderHistoryPage = () => {
    const { all_product } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get-orders`, {
                    headers: {
                        'auth-token': localStorage.getItem('auth-token')
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setOrders(sorted);
                }
            } catch (error) {
                console.error('Error calling API:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const truncateId = (id) => {
        if (!id) return '';
        return id.length > 12 ? `${id.slice(-8)}` : id;
    };

    const getOrderStats = () => {
        const completed = orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped').length;
        const pending = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
        return { total: orders.length, completed, pending };
    };

    const getPaymentName = (method) => {
        const names = { card: 'Credit Card', ViettelMoney: 'Viettel Money', bank: 'Bank Transfer', cod: 'COD' };
        return names[method] || method;
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <div className="order-history-page">
                <div className="order-history-inner">
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <span className="loading-text">Loading your orders...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <div className="order-history-inner">

                {/* Header */}
                <div className="order-history-header">
                    <div className="order-history-title-row">
                        <div className="order-history-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <h1>My Orders</h1>
                        {orders.length > 0 && (
                            <span className="order-count-badge">{orders.length} orders</span>
                        )}
                    </div>
                </div>

                {orders.length > 0 ? (
                    <>
                        {/* Summary Stats */}
                        <div className="orders-summary">
                            <div className="summary-stat-card">
                                <div className="summary-stat-icon all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                </div>
                                <div className="summary-stat-info">
                                    <span className="summary-stat-value">{stats.total}</span>
                                    <span className="summary-stat-label">Total Orders</span>
                                </div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-icon pending">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div className="summary-stat-info">
                                    <span className="summary-stat-value">{stats.pending}</span>
                                    <span className="summary-stat-label">In Progress</span>
                                </div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-icon completed">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div className="summary-stat-info">
                                    <span className="summary-stat-value">{stats.completed}</span>
                                    <span className="summary-stat-label">Completed</span>
                                </div>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="orders-list">
                            {orders.map(order => {
                                const isExpanded = expandedOrders[order._id];
                                return (
                                    <div key={order._id} className="order-card">
                                        {/* Header */}
                                        <div
                                            className="order-card-header"
                                            onClick={() => toggleOrder(order._id)}
                                        >
                                            <div className="order-header-left">
                                                <div className="order-id-chip">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                                    </svg>
                                                    #{truncateId(order._id)}
                                                </div>
                                                <div className="order-header-meta">
                                                    <span className="order-date">{formatDate(order.date)}</span>
                                                    <span className="order-items-count">
                                                        {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="order-header-right">
                                                <span className={`status-badge status-${order.orderStatus}`}>
                                                    {order.orderStatus}
                                                </span>
                                                <button className={`order-expand-btn ${isExpanded ? 'expanded' : ''}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body (expanded) */}
                                        {isExpanded && (
                                            <div className="order-card-body">
                                                <div className="order-body-grid">
                                                    {/* Shipping Info */}
                                                    <div className="order-shipping-card">
                                                        <h4 className="order-shipping-title">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                <circle cx="12" cy="10" r="3"></circle>
                                                            </svg>
                                                            Delivery Info
                                                        </h4>
                                                        <div className="shipping-field">
                                                            <span className="shipping-field-label">Recipient</span>
                                                            <span className="shipping-field-value">{order.shippingInfo?.name}</span>
                                                        </div>
                                                        <div className="shipping-field">
                                                            <span className="shipping-field-label">Phone</span>
                                                            <span className="shipping-field-value">{order.shippingInfo?.phone}</span>
                                                        </div>
                                                        <div className="shipping-field">
                                                            <span className="shipping-field-label">Address</span>
                                                            <span className="shipping-field-value">{order.shippingInfo?.address}</span>
                                                        </div>
                                                    </div>

                                                    {/* Products */}
                                                    <div className="order-products-card">
                                                        <h4 className="order-products-title">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                                                            </svg>
                                                            Items
                                                        </h4>
                                                        {order.products.map(product => {
                                                            const productInfo = all_product.find(p => p.id === product.productId);
                                                            const subtotal = product.price * product.quantity;
                                                            return (
                                                                <div key={`${product.productId}-${product.size}`} className="order-product-row">
                                                                    {productInfo && (
                                                                        <div className="order-product-image">
                                                                            <img src={productInfo.image} alt={productInfo.name} />
                                                                        </div>
                                                                    )}
                                                                    <div className="order-product-info">
                                                                        <span className="order-product-name">
                                                                            {productInfo ? productInfo.name : 'Product not found'}
                                                                        </span>
                                                                        <div className="order-product-meta">
                                                                            {product.size && (
                                                                                <span className="product-meta-tag">{product.size}</span>
                                                                            )}
                                                                            <span className="product-meta-tag">x{product.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="order-product-price">
                                                                        <span className="order-product-unit-price">${product.price.toFixed(2)}</span>
                                                                        <span className="order-product-subtotal">${subtotal.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="order-card-footer">
                                            <div className="order-footer-left">
                                                <div className="order-payment-badge">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                                    </svg>
                                                    {getPaymentName(order.paymentMethod)}
                                                </div>
                                            </div>
                                            <div className="order-total-display">
                                                <span className="order-total-label">Total</span>
                                                <span className="order-total-value">${order.totalAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="order-footer-right">
                                                <button className="btn-reorder">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="23 4 23 10 17 10"></polyline>
                                                        <polyline points="1 20 1 14 7 14"></polyline>
                                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                                    </svg>
                                                    Reorder
                                                </button>
                                                <Link to={`/order-confirmation?orderId=${order._id}`} className="btn-view-details">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                        <h2 className="empty-orders-title">No Orders Yet</h2>
                        <p className="empty-orders-desc">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                        <Link to="/shop" className="shop-now-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;