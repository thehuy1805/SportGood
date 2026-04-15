import React, { useState, useEffect, useCallback } from 'react';
import '../ReviewModeration/ReviewModeration.css';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const ReviewModeration = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth-token');
            const query = filter !== 'all' ? `?visible=${filter === 'visible'}` : '';
            const res = await fetch(`${API_BASE_URL}/api/admin/reviews${query}`, {
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load reviews.');
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Toggle visible / hidden
    const handleToggle = async (reviewId) => {
        setActionLoading(reviewId);
        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}/toggle-visibility`, {
                method: 'PUT',
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReviews(prev => prev.map(r =>
                r._id === reviewId ? { ...r, isVisible: data.isVisible } : r
            ));
        } catch (err) {
            toast.error('Error: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Delete review
    const handleDelete = async (reviewId) => {
        setActionLoading(reviewId);
        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            setConfirmDelete(null);
        } catch (err) {
            toast.error('Error: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter + search
    const filtered = reviews.filter(r => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
            (r.productName || '').toLowerCase().includes(q) ||
            (r.userName || '').toLowerCase().includes(q) ||
            (r.content || '').toLowerCase().includes(q)
        );
    });

    const visibleCount = reviews.filter(r => r.isVisible).length;
    const hiddenCount = reviews.filter(r => !r.isVisible).length;

    // Pagination
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset page on filter/search change
    useEffect(() => { setPage(1); }, [filter, search]);

    const renderStars = (rating) => (
        <div className="review-stars">
            {[1,2,3,4,5].map(i => (
                <span key={i} className={`review-star ${i <= rating ? 'filled' : ''}`}>★</span>
            ))}
        </div>
    );

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="review-page">
                <div className="review-loading">
                    <div className="review-spinner" />
                    <span className="review-loading-text">Loading reviews...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="review-page">

            {/* Page Header */}
            <div className="review-header">
                <div className="review-title">
                    <div className="review-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h1>
                        Review Moderation
                        <span className="review-count-badge">{reviews.length} total</span>
                    </h1>
                </div>
                <button className="review-refresh-btn" onClick={fetchReviews}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 .49-4.95"></path>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="review-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            {/* Summary Stats */}
            <div className="review-stats-row">
                <div className="review-stat-card total">
                    <div className="review-stat-icon">📋</div>
                    <div>
                        <div className="review-stat-value">{reviews.length}</div>
                        <div className="review-stat-label">Total Reviews</div>
                    </div>
                </div>
                <div className="review-stat-card visible">
                    <div className="review-stat-icon">✅</div>
                    <div>
                        <div className="review-stat-value">{visibleCount}</div>
                        <div className="review-stat-label">Visible</div>
                    </div>
                </div>
                <div className="review-stat-card hidden">
                    <div className="review-stat-icon">🚫</div>
                    <div>
                        <div className="review-stat-value">{hiddenCount}</div>
                        <div className="review-stat-label">Hidden</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="review-controls">
                <div className="review-search">
                    <div className="review-search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="review-search-input"
                        placeholder="Search by product, user, or content..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="review-filter-tabs">
                    <button className={`review-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All ({reviews.length})
                    </button>
                    <button className={`review-filter-tab ${filter === 'visible' ? 'active' : ''}`} onClick={() => setFilter('visible')}>
                        Visible ({visibleCount})
                    </button>
                    <button className={`review-filter-tab ${filter === 'hidden' ? 'active' : ''}`} onClick={() => setFilter('hidden')}>
                        Hidden ({hiddenCount})
                    </button>
                </div>
            </div>

            {/* Table */}
            {paged.length === 0 ? (
                <div className="review-empty">
                    <div className="review-empty-icon">📭</div>
                    <h3 className="review-empty-title">No Reviews Found</h3>
                    <p className="review-empty-desc">
                        {(filter === 'all' && !search) ? 'No reviews have been submitted yet.' : 'No results match your search.'}
                    </p>
                </div>
            ) : (
                <div className="review-table-card">
                    <div className="review-table-wrapper">
                        <table className="review-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '25%' }}>Product</th>
                                    <th style={{ width: '12%' }}>Reviewer</th>
                                    <th style={{ width: '22%' }}>Content</th>
                                    <th style={{ width: '10%' }}>Date</th>
                                    <th style={{ width: '9%' }}>Status</th>
                                    <th style={{ width: '22%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(review => (
                                    <tr key={review._id} className={!review.isVisible ? 'row-hidden' : ''}>
                                        <td>
                                            <div className="review-product-cell">
                                                {review.productImage && (
                                                    <img
                                                        src={`${API_BASE_URL}/${review.productImage}`}
                                                        alt={review.productName}
                                                        className="review-product-thumb"
                                                        onError={e => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <span className="review-product-name">{review.productName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="review-user-cell">
                                                <span className="review-user-name">{review.userName}</span>
                                                <span className="review-user-id">#{review.userId?.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {renderStars(review.rating)}
                                            <p className="review-content-text">"{review.content}"</p>
                                        </td>
                                        <td>
                                            <span className="review-date">{formatDate(review.date)}</span>
                                        </td>
                                        <td>
                                            <span className={`review-status-badge ${review.isVisible ? 'visible' : 'hidden'}`}>
                                                {review.isVisible ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="review-actions">
                                                <button
                                                    className={`review-btn ${review.isVisible ? 'review-btn-hide' : 'review-btn-show'}`}
                                                    onClick={() => handleToggle(review._id)}
                                                    disabled={actionLoading === review._id}
                                                    title={review.isVisible ? 'Hide review' : 'Show review'}
                                                >
                                                    {actionLoading === review._id
                                                        ? '...'
                                                        : review.isVisible
                                                            ? <>👁 Hide</>
                                                            : <>👁 Show</>
                                                    }
                                                </button>
                                                <button
                                                    className="review-btn review-btn-delete"
                                                    onClick={() => setConfirmDelete(review._id)}
                                                    title="Delete review"
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>

                                            {/* Confirm delete */}
                                            {confirmDelete === review._id && (
                                                <div className="review-confirm">
                                                    <p className="review-confirm-text">Confirm delete this review?</p>
                                                    <div className="review-confirm-btns">
                                                        <button
                                                            className="review-btn-confirm-delete"
                                                            onClick={() => handleDelete(review._id)}
                                                            disabled={actionLoading === review._id}
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            className="review-btn-confirm-cancel"
                                                            onClick={() => setConfirmDelete(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="review-pagination">
                            <button
                                className="review-page-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === '...'
                                        ? <span key={`ellipsis-${i}`} className="review-page-ellipsis">…</span>
                                        : <button key={p} className={`review-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                )
                            }
                            <button
                                className="review-page-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >›</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewModeration;
