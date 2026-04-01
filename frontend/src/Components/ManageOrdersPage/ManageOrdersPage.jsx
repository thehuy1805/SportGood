import React, { useEffect, useState } from 'react';
import './ManageOrdersPage.css';

export const ManageOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:4000/staff/get-all-orders', {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:4000/staff/update-order-status/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ newStatus })
            });
            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, orderStatus: newStatus } : order
                    )
                );
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const truncateId = (id) => {
        if (!id) return '';
        return id.length > 12 ? id.slice(-8) : id;
    };

    return (
        <div style={{ padding: '32px' }}>
            <div className="manage-orders-header">
                <div className="manage-orders-title">
                    <div className="manage-orders-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    </div>
                    <h1>Order Management</h1>
                    {orders.length > 0 && (
                        <span className="orders-count-chip">{orders.length} orders</span>
                    )}
                </div>
            </div>

            {orders.length > 0 ? (
                <div className="manage-orders-table-card">
                    <div className="admin-table-wrapper">
                        <table className="admin-table manage-orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <React.Fragment key={order._id}>
                                        <tr>
                                            <td>
                                                <span className="order-id-cell">#{truncateId(order._id)}</span>
                                            </td>
                                            <td>
                                                <span className="order-date-cell">{formatDate(order.date)}</span>
                                            </td>
                                            <td>
                                                <span className="order-total-cell">${order.totalAmount.toFixed(2)}</span>
                                            </td>
                                            <td>
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`order-status-select ${order.orderStatus}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="order-details-btn"
                                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                >
                                                    {expandedOrder === order._id ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order._id && (
                                            <tr className="order-details-row">
                                                <td colSpan="5">
                                                    <div className="products-table-container">
                                                        <h4>Order Items</h4>
                                                        <table className="products-mini-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product ID</th>
                                                                    <th>Size</th>
                                                                    <th>Qty</th>
                                                                    <th>Price</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.products.map(product => (
                                                                    <tr key={product.productId}>
                                                                        <td>#{product.productId}</td>
                                                                        <td>{product.size || 'N/A'}</td>
                                                                        <td>{product.quantity}</td>
                                                                        <td>${product.price?.toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="admin-card">
                    <div className="admin-empty">
                        <div className="admin-empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <p className="admin-empty-title">No Orders Yet</p>
                        <p className="admin-empty-desc">Orders will appear here once customers start placing them.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrdersPage;
