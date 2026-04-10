import React, { useState, useEffect } from 'react';
import '../LowStockAlerts/LowStockAlerts.css';

const LowStockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProduct, setExpandedProduct] = useState(null);

    const fetchAlerts = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch('http://localhost:4000/api/admin/low-stock-alerts', {
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load data.');
            setAlerts(data.alerts);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    // Nhóm alerts theo productId
    const groupedByProduct = {};
    alerts.forEach(alert => {
        if (!groupedByProduct[alert.productId]) {
            groupedByProduct[alert.productId] = { ...alert, sizes: [alert.size], alerts: [alert] };
        } else {
            groupedByProduct[alert.productId].sizes.push(alert.size);
            groupedByProduct[alert.productId].alerts.push(alert);
        }
    });

    const groupedList = Object.values(groupedByProduct);

    const filteredList = groupedList.filter(item => {
        const matchesStatus = filterStatus === 'all' || item.alerts.some(a => a.status === filterStatus);
        const matchesSearch = !searchTerm || item.productName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const outOfStockCount = groupedList.filter(item => item.alerts.some(a => a.status === 'out_of_stock')).length;
    const lowStockCount = groupedList.filter(item => item.alerts.some(a => a.status === 'low_stock')).length;

    const getSeverityBadge = (status) => {
        if (status === 'out_of_stock') {
            return <span className="alerts-severity-badge out-of-stock">Out of Stock</span>;
        }
        return <span className="alerts-severity-badge low-stock">Low Stock</span>;
    };

    const worstStatus = (item) =>
        item.alerts.some(a => a.status === 'out_of_stock') ? 'out_of_stock' : 'low_stock';

    if (loading) {
        return (
            <div className="alerts-page">
                <div className="alerts-loading">
                    <div className="alerts-spinner" />
                    <span className="alerts-loading-text">Loading alerts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="alerts-page">

            {/* Page Header */}
            <div className="alerts-header">
                <div className="alerts-title">
                    <div className="alerts-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div>
                        <h1>
                            Low Stock Alerts
                            <span className="alerts-count-badge">{total} total</span>
                        </h1>
                    </div>
                </div>
                <button className="alerts-refresh-btn" onClick={fetchAlerts}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 .49-4.95"></path>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="alerts-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            {/* Summary Stats */}
            <div className="alerts-stats-row">
                <div className="alerts-stat-card total">
                    <div className="alerts-stat-icon">⚠️</div>
                    <div>
                        <div className="alerts-stat-value">{total}</div>
                        <div className="alerts-stat-label">Total Alerts</div>
                    </div>
                </div>
                <div className="alerts-stat-card out">
                    <div className="alerts-stat-icon">🚫</div>
                    <div>
                        <div className="alerts-stat-value">{outOfStockCount}</div>
                        <div className="alerts-stat-label">Out of Stock</div>
                    </div>
                </div>
                <div className="alerts-stat-card low">
                    <div className="alerts-stat-icon">📉</div>
                    <div>
                        <div className="alerts-stat-value">{lowStockCount}</div>
                        <div className="alerts-stat-label">Low Stock</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="alerts-controls">
                <div className="alerts-search">
                    <div className="alerts-search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="alerts-search-input"
                        placeholder="Search by product name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="alerts-filter-tabs">
                    <button className={`alerts-filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                        All ({total})
                    </button>
                    <button className={`alerts-filter-tab ${filterStatus === 'out_of_stock' ? 'active' : ''}`} onClick={() => setFilterStatus('out_of_stock')}>
                        Out of Stock ({outOfStockCount})
                    </button>
                    <button className={`alerts-filter-tab ${filterStatus === 'low_stock' ? 'active' : ''}`} onClick={() => setFilterStatus('low_stock')}>
                        Low Stock ({lowStockCount})
                    </button>
                </div>
            </div>

            {/* Alert List */}
            {filteredList.length === 0 ? (
                <div className="alerts-empty">
                    <div className="alerts-empty-icon">✅</div>
                    <h3 className="alerts-empty-title">No Alerts</h3>
                    <p className="alerts-empty-desc">All products are well stocked!</p>
                </div>
            ) : (
                filteredList.map(product => {
                    const sev = worstStatus(product);
                    const isExpanded = expandedProduct === product.productId;
                    return (
                        <div key={product.productId} className={`alerts-card severity-${sev === 'out_of_stock' ? 'out' : 'low'}`}>
                            <div
                                className="alerts-card-header"
                                onClick={() => setExpandedProduct(isExpanded ? null : product.productId)}
                            >
                                <div className="alerts-card-left">
                                    <img
                                        src={`http://localhost:4000/${product.image}`}
                                        alt={product.productName}
                                        className="alerts-product-thumb"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="alerts-product-info">
                                        <div className="alerts-product-name-row">
                                            <span className="alerts-product-name">{product.productName}</span>
                                            {getSeverityBadge(sev === 'out_of_stock' ? 'out_of_stock' : 'low_stock')}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
                                            <span className="alerts-chip alerts-chip-category">{product.detailedCategory}</span>
                                            <span className="alerts-chip alerts-chip-general">{product.generalCategory}</span>
                                        </div>
                                        <div className="alerts-size-chips">
                                            {product.sizes.map((size, i) => {
                                                const a = product.alerts[i];
                                                return (
                                                    <span key={i} className={`alerts-size-chip ${a?.status === 'out_of_stock' ? 'out' : 'low'}`}>
                                                        {size} ({a?.remainingQuantity ?? 0})
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className={`alerts-expand-arrow ${isExpanded ? 'expanded' : ''}`}>▼</div>
                            </div>

                            {isExpanded && (
                                <div className="alerts-card-details">
                                    <table className="alerts-details-table">
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                <th>Status</th>
                                                <th>Stock</th>
                                                <th>Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.alerts.map((a, i) => (
                                                <tr key={i}>
                                                    <td><strong>{a.size}</strong></td>
                                                    <td>{getSeverityBadge(a.status)}</td>
                                                    <td>
                                                        <span className={`alerts-stock-value ${a.status === 'out_of_stock' ? 'out' : 'low'}`}>
                                                            {a.remainingQuantity} units
                                                        </span>
                                                    </td>
                                                    <td className="alerts-type-cell">
                                                        {a.type === 'size' ? 'Clothes / Shoes' : 'Sports Equipment'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="alerts-details-footer">
                                        <a href={`/update-product/${product.productId}`} className="alerts-update-link">
                                            Update Stock
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default LowStockAlerts;
