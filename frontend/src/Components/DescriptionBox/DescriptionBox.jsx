// DescriptionBox.jsx
import React, { useState, useEffect, useContext } from 'react';
import './DescriptionBox.css';
import { AuthContext } from '../../Context/AuthContext';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const StarIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#f05353" : "none"} stroke={filled ? "#f05353" : "#d0d0d0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DescriptionBox = ({ productId, product, onFeedbacksChange }) => {
  const { isLoggedIn, token } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, content: '' });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-feedbacks/${productId}`);
        const data = await response.json();
        setFeedbacks(data);
        onFeedbacksChange(data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };
    fetchFeedbacks();
  }, [productId, onFeedbacksChange]);

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: feedbacks.filter(f => f.rating === star).length,
    percent: feedbacks.length > 0 ? (feedbacks.filter(f => f.rating === star).length / feedbacks.length) * 100 : 0
  }));

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStarClick = (rating) => {
    setNewFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) return;
    if (newFeedback.rating === 0) {
      toast.warn('Please select a star rating.');
      return;
    }
    if (!newFeedback.content.trim()) {
      toast.warn('Please write your review.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ ...newFeedback, productId })
      });

      if (response.ok) {
        const newFeedbackData = await response.json();
        setFeedbacks([...feedbacks, newFeedbackData]);
        setNewFeedback({ rating: 0, content: '' });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="descriptionbox">
      {/* Title */}
      <div className="db-section-title">
        <h2>Customer Reviews</h2>
        <div className="db-title-line" />
      </div>

      {/* Rating Summary */}
      <div className="db-rating-summary">
        <div className="db-rating-score">
          <span className="db-score-number">{averageRating}</span>
          <span className="db-score-label">out of 5</span>
        </div>

        <div className="db-rating-divider" />

        <div className="db-rating-details">
          {ratingCounts.map(({ star, count, percent }) => (
            <div key={star} className="db-rating-bar-row">
              <span className="db-bar-label">{star}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f05353" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="db-bar-track">
                <div className="db-bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="db-review-count">
          <div className="db-review-count-number">{feedbacks.length}</div>
          <div className="db-review-count-label">Total Reviews</div>
        </div>
      </div>

      {/* Reviews Grid */}
      {feedbacks.length > 0 ? (
        <div className="db-reviews-grid">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="db-review-card">
              <div className="db-review-header">
                <div className="db-avatar">
                  {getInitials(feedback.userName)}
                </div>
                <div className="db-review-user-info">
                  <p className="db-review-user-name">{feedback.userName}</p>
                  <div className="db-review-meta">
                    <span className="db-review-date">{formatDate(feedback.date)}</span>
                    <div className="db-review-stars">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < feedback.rating} />
                      ))}
                    </div>
                    <span className="db-verified-badge">
                      <CheckCircleIcon /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <p className="db-review-content">{feedback.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="db-empty-state">
          <div className="db-empty-icon">
            <MessageSquareIcon />
          </div>
          <h3>No reviews yet</h3>
          <p>Be the first to share your thoughts on this product.</p>
        </div>
      )}

      {/* Write Review Form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmitFeedback} className="db-write-review">
          <h3>Share Your Experience</h3>
          <p>Help others by writing a honest review about this product.</p>

          <div className="db-form-group">
            <span className="db-form-label">Your Rating</span>
            <div className="db-star-picker">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={i < newFeedback.rating ? "#f05353" : "none"}
                  stroke={i < newFeedback.rating ? "#f05353" : "#d0d0d0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={i < newFeedback.rating ? 'active' : ''}
                  onClick={() => handleStarClick(i + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          </div>

          <div className="db-form-group">
            <span className="db-form-label">Your Review</span>
            <textarea
              className="db-textarea"
              value={newFeedback.content}
              onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What did you like or dislike? How was the quality? Would you recommend it?"
            />
          </div>

          <button type="submit" className="db-submit-btn">
            Submit Review
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="db-login-prompt">
          <p>
            <strong>Login</strong> to share your review and help others make better choices.
          </p>
        </div>
      )}
    </div>
  );
};

export default DescriptionBox;
