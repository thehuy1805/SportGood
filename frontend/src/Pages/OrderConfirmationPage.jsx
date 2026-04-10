import React, { useEffect, useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/OrderConfirmationPage.css';
import API_BASE_URL from '../config';

const OrderConfirmationPage = () => {
  const { all_product } = useContext(ShopContext);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-order/${orderId}`, {
          headers: {
            'auth-token': localStorage.getItem('auth-token')
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        }
      } catch (error) {
        console.error('Error calling API:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="order-confirm-page">
        <div className="order-confirm-inner">
          <div className="loading-state">
            <div className="loading-spinner" />
            <span className="loading-text">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-confirm-page">
        <div className="order-confirm-inner">
          <div className="loading-state">
            <span className="loading-text">Order not found.</span>
            <Link to="/shop" className="btn-primary">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  const total = orderDetails.totalAmount || 0;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const truncateId = (id) => {
    if (!id) return '';
    return id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-6)}` : id;
  };

  const paymentIcons = {
    card: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    ),
    ViettelMoney: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.94 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    bank: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22"></line>
        <line x1="6" y1="18" x2="6" y2="11"></line>
        <line x1="10" y1="18" x2="10" y2="11"></line>
        <line x1="14" y1="18" x2="14" y2="11"></line>
        <line x1="18" y1="18" x2="18" y2="11"></line>
        <polygon points="12 2 20 7 4 7"></polygon>
      </svg>
    ),
    cod: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    )
  };

  const getPaymentName = (method) => {
    const names = { card: 'Credit Card', ViettelMoney: 'Viettel Money', bank: 'Bank Transfer', cod: 'Cash on Delivery' };
    return names[method] || method;
  };

  return (
    <div className="order-confirm-page">
      <div className="order-confirm-inner">

        {/* Success Hero */}
        <div className="success-hero">
          <div className="success-icon-ring">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p>
            Thank you for your purchase. Your order has been placed successfully and is being processed.
            We'll notify you when it ships.
          </p>
          <div className="order-id-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Order <span>#{truncateId(orderDetails._id)}</span>
          </div>
        </div>

        <div className="order-confirm-layout">

          {/* Order Status */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h2 className="section-title">Order Status</h2>
            </div>
            <div className="status-row">
              <span className={`status-badge status-${orderDetails.orderStatus}`}>
                {orderDetails.orderStatus}
              </span>
              <span className="order-date">{formatDate(orderDetails.date)}</span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h2 className="section-title">Delivery Information</h2>
            </div>
            <div className="shipping-grid">
              <div className="shipping-field">
                <span className="shipping-label">Recipient</span>
                <span className="shipping-value">{orderDetails.shippingInfo?.name}</span>
              </div>
              <div className="shipping-field">
                <span className="shipping-label">Phone</span>
                <span className="shipping-value">{orderDetails.shippingInfo?.phone}</span>
              </div>
              <div className="shipping-field">
                <span className="shipping-label">Email</span>
                <span className="shipping-value">{orderDetails.shippingInfo?.email}</span>
              </div>
              <div className="shipping-field">
                <span className="shipping-label">Payment</span>
                <div className="payment-method-badge">
                  {paymentIcons[orderDetails.paymentMethod] || paymentIcons.cod}
                  {getPaymentName(orderDetails.paymentMethod)}
                </div>
              </div>
              <div className="shipping-field full">
                <span className="shipping-label">Delivery Address</span>
                <span className="shipping-value">{orderDetails.shippingInfo?.address}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h2 className="section-title">Order Details</h2>
            </div>
            <div className="products-list">
              {orderDetails.products.map(item => {
                const product = all_product.find(p => p.id === item.productId);
                if (!product) return null;
                const subtotal = item.price * item.quantity;
                return (
                  <div key={`${item.productId}-${item.size}`} className="product-row">
                    <div className="product-row-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-row-info">
                      <p className="product-row-name">{product.name}</p>
                      <div className="product-row-meta">
                        {item.size && (
                          <span className="meta-tag">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            {item.size}
                          </span>
                        )}
                        <span className="meta-tag">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="product-row-price">
                      <div className="product-row-unit-price">${item.price.toFixed(2)} / item</div>
                      <div className="product-row-subtotal">${subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Total */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h2 className="section-title">Order Total</h2>
            </div>
            <div className="order-summary-section">
              <div className="summary-line">
                <span className="summary-line-label">Items ({orderDetails.products.length})</span>
                <span className="summary-line-value">${total.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span className="summary-line-label">Shipping</span>
                <span className="summary-line-value free">Free</span>
              </div>
              <div className="summary-line">
                <span className="summary-line-label">Tax</span>
                <span className="summary-line-value">$0.00</span>
              </div>
              <div className="summary-divider" />
              <div className="total-line">
                <span className="total-line-label">Total Paid</span>
                <span className="total-line-value">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="section-card">
            <div className="action-buttons">
              <Link to="/order-history" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                View Order History
              </Link>
              <Link to="/shop" className="btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
