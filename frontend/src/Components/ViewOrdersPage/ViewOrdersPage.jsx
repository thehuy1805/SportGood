import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import './ViewOrdersPage.css';
import API_BASE_URL from '../../config';

const ViewOrdersPage = () => {
  const { all_product } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/get-orders`, {
          headers: { 'auth-token': localStorage.getItem('auth-token') }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          setFilteredOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ backgroundColor: 'rgba(249,115,22,0.25)', color: '#f97316', padding: '1px 3px', borderRadius: 3 }}>{part}</span>
        : part
    );
  };

  const filterOrders = (term) => {
    const filtered = orders.filter(order =>
      order._id.includes(term) ||
      order.shippingInfo?.name?.toLowerCase().includes(term.toLowerCase()) ||
      order.shippingInfo?.email?.toLowerCase().includes(term.toLowerCase()) ||
      order.orderStatus?.toLowerCase().includes(term.toLowerCase()) ||
      order.paymentMethod?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterOrders(value);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusClass = (status) => {
    const map = {
      pending: 'pending', processing: 'processing',
      shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled'
    };
    return map[status?.toLowerCase()] || 'pending';
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  const truncateId = (id) => id ? (id.length > 12 ? id.slice(-8) : id) : '';

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (currentPage > 1) {
      pages.push(
        <button key="prev" className="page-btn nav" onClick={() => setCurrentPage(p => p - 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      );
    }

    if (start > 1) {
      pages.push(<button key={1} className="page-btn" onClick={() => setCurrentPage(1)}>1</button>);
      if (start > 2) pages.push(<span key="s1" className="page-ellipsis">…</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={`page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="e1" className="page-ellipsis">…</span>);
      pages.push(<button key={totalPages} className="page-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>);
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" className="page-btn nav" onClick={() => setCurrentPage(p => p + 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      );
    }

    return pages;
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="view-orders-header">
        <div className="view-orders-title">
          <div className="view-orders-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h1>Order Management</h1>
          {filteredOrders.length > 0 && (
            <span className="orders-count-badge">{filteredOrders.length} orders</span>
          )}
        </div>
        <div className="view-orders-controls">
          <div className="view-orders-search">
            <span className="view-orders-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by ID, name, email, status..."
              className="view-orders-search-input"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="view-orders-card">
          <div className="admin-table-wrapper">
            <table className="view-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr>
                      <td><span className="order-id-text">#{truncateId(order._id)}</span></td>
                      <td><span className="order-date-text">{formatDate(order.date)}</span></td>
                      <td><span className="order-total-text">${order.totalAmount.toFixed(2)}</span></td>
                      <td>
                        <span className={`order-status-badge ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <span className="order-payment-chip">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                          </svg>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <OrderExpandBtn orderId={order._id} />
                      </td>
                    </tr>
                    <OrderDetailsRow order={order} all_product={all_product} highlightText={highlightText} />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="view-orders-pagination">
              {renderPages()}
            </div>
          )}
        </div>
      ) : (
        <div className="product-empty">
          <div className="product-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <p className="product-empty-title">No Orders Found</p>
          <p className="product-empty-desc">
            {searchTerm ? `No orders match "${searchTerm}". Try a different search term.` : 'No orders have been placed yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

const OrderExpandBtn = ({ orderId }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        className={`expand-details-btn ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? 'Hide' : 'View'}
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <input type="hidden" id={`expand-${orderId}`} value={expanded ? '1' : '0'} />
    </>
  );
};

const OrderDetailsRow = React.memo(({ order, all_product, highlightText }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkExpanded = () => {
      const el = document.getElementById(`expand-${order._id}`);
      if (el) setExpanded(el.value === '1');
    };
    const interval = setInterval(checkExpanded, 100);
    return () => clearInterval(interval);
  }, [order._id]);

  if (!expanded) return null;

  return (
    <tr className="view-orders-expanded-row">
      <td colSpan="6">
        <div className="view-orders-expanded-inner">
          {/* Shipping Info */}
          <div className="shipping-info-section">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Delivery Information
            </h4>
            <div className="shipping-field-row">
              <span className="shipping-field-label">Recipient</span>
              <span className="shipping-field-value">{highlightText(order.shippingInfo?.name || '')}</span>
            </div>
            <div className="shipping-field-row">
              <span className="shipping-field-label">Phone</span>
              <span className="shipping-field-value">{highlightText(order.shippingInfo?.phone || '')}</span>
            </div>
            <div className="shipping-field-row">
              <span className="shipping-field-label">Email</span>
              <span className="shipping-field-value">{highlightText(order.shippingInfo?.email || '')}</span>
            </div>
            <div className="shipping-field-row">
              <span className="shipping-field-label">Address</span>
              <span className="shipping-field-value">{highlightText(order.shippingInfo?.address || '')}</span>
            </div>
          </div>

          {/* Products */}
          <div className="products-section">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Order Items ({order.products?.length || 0})
            </h4>
            {order.products?.map((product, idx) => {
              const productInfo = all_product.find(p => p.id === product.productId);
              return (
                <div key={`${product.productId}-${idx}`} className="product-item-mini">
                  {productInfo?.image ? (
                    <img src={productInfo.image} alt={productInfo.name} className="product-mini-image" />
                  ) : (
                    <div className="product-mini-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="product-mini-info">
                    <span className="product-mini-name">
                      {productInfo ? highlightText(productInfo.name) : `Product #${product.productId}`}
                    </span>
                    <span className="product-mini-meta">
                      {product.size && <span>Size: {product.size} · </span>}
                      Qty: {product.quantity}
                    </span>
                  </div>
                  <span className="product-mini-price">
                    ${(product.price * product.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </td>
    </tr>
  );
});

export default ViewOrdersPage;
