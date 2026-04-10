import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import './CSS/MyProfilePage.css';
import API_BASE_URL from '../config';

const MyProfilePage = () => {
    const { userId, login } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/get-profile`, {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
                const res = await fetch(`${API_BASE_URL}/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                if (data.user.name) {
                    login(
                        localStorage.getItem('auth-token'),
                        localStorage.getItem('role'),
                        localStorage.getItem('user-id'),
                        data.user.name
                    );
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    email: formData.email,
                    currentPassword: passwordData.currentPassword,
                    password: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(false);
            } else {
                setPasswordError(data.error || 'Failed to change password.');
            }
        } catch {
            setPasswordError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-page-inner">
                    <div className="profile-loading">
                        <div className="profile-spinner" />
                        <span>Loading profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-page-inner">
                {/* Header */}
                <div className="profile-page-header">
                    <div className="profile-page-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your personal information</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`profile-message ${message.type}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {message.type === 'success' ? (
                                <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                                <>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </>
                            )}
                        </svg>
                        {message.text}
                    </div>
                )}

                <div className="profile-content-grid">
                    {/* Profile Info Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3>Personal Information</h3>
                        </div>
                        <form className="profile-card-body" onSubmit={handleSaveProfile}>
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="profile-avatar-info">
                                    <span className="profile-avatar-name">{formData.name || 'User'}</span>
                                    <span className="profile-avatar-email">{formData.email}</span>
                                </div>
                            </div>

                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Full Name</label>
                                    <div className="profile-input-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="profile-form-group">
                                    <label>Email Address</label>
                                    <div className="profile-input-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="profile-input-readonly"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    <small className="profile-input-hint">Email cannot be changed</small>
                                </div>

                                <div className="profile-form-group">
                                    <label>Phone Number</label>
                                    <div className="profile-input-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="profile-save-btn" disabled={saving}>
                                {saving ? (
                                    <div className="profile-btn-spinner" />
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Password Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3>Security</h3>
                        </div>
                        <div className="profile-card-body">
                            <div className="security-item">
                                <div className="security-item-info">
                                    <div className="security-item-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="security-item-label">Password</span>
                                        <span className="security-item-desc">Last changed: Unknown</span>
                                    </div>
                                </div>
                                <button
                                    className="security-change-btn"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    {showPasswordForm ? 'Cancel' : 'Change'}
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form className="password-form" onSubmit={handleChangePassword}>
                                    {passwordError && (
                                        <div className="profile-message error">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                            </svg>
                                            {passwordError}
                                        </div>
                                    )}

                                    <div className="profile-form-group">
                                        <label>Current Password</label>
                                        <div className="profile-input-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-group">
                                        <label>New Password</label>
                                        <div className="profile-input-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                                placeholder="At least 6 characters"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-group">
                                        <label>Confirm New Password</label>
                                        <div className="profile-input-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                                placeholder="Re-enter new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="profile-save-btn" disabled={saving}>
                                        {saving ? (
                                            <div className="profile-btn-spinner" />
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                                </svg>
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
