import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './CSS/LoginSignup.css';
import API_BASE_URL from '../config';

export const LoginSignup = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [showForgot, setShowForgot] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });

    const [forgotStep, setForgotStep] = useState(1);
    const [otpInput, setOtpInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [localSuccess, setLocalSuccess] = useState('');

    const changeHandler = (e) => {
        if (e.target.type === 'checkbox') {
            setAgreedToTerms(e.target.checked);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const clearMessages = () => {
        setMessage(null);
        setLocalError('');
        setLocalSuccess('');
    };

    const handleLogin = async () => {
        if (!agreedToTerms) {
            setMessage({ type: 'error', text: 'Please agree to the terms of use & privacy policy.' });
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                login(data.token, data.role, data.user.id, data.name);
                const returnUrl = localStorage.getItem('returnAfterLogin');
                localStorage.removeItem('returnAfterLogin');

                // Neu la admin hoac staff, chuyen huong ve trang tuong ung bo qua returnUrl
                if (data.role === 'admin') {
                    navigate('/admin', { replace: true });
                } else if (data.role === 'staff') {
                    navigate('/staff', { replace: true });
                } else if (returnUrl) {
                    navigate(returnUrl, { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                setMessage({ type: 'error', text: data.errors || 'Login failed. Please check your credentials.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!agreedToTerms) {
            setMessage({ type: 'error', text: 'Please agree to the terms of use & privacy policy.' });
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                if (data.token && data.role && data.user?.id) {
                    login(data.token, data.role, data.user.id, data.name);
                    navigate('/');
                } else {
                    setMessage({ type: 'error', text: 'Signup succeeded but missing user data. Please contact support.' });
                }
            } else {
                setMessage({ type: 'error', text: data.errors || 'Signup failed. Please try again.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setLocalError('Please enter your email address.');
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (data.success) {
                setForgotStep(2);
                setLocalSuccess('OTP sent successfully! Check your email.');
            } else {
                setLocalError(data.error || 'Failed to send OTP. Please check your email.');
            }
        } catch {
            setLocalError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpInput) {
            setLocalError('Please enter the OTP code.');
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpInput }),
            });
            const data = await res.json();
            if (data.success) {
                setForgotStep(3);
                setLocalSuccess('OTP verified! Set your new password.');
            } else {
                setLocalError(data.error || 'Incorrect OTP. Please try again.');
            }
        } catch {
            setLocalError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setLocalSuccess('Password updated! Redirecting to login...');
                setTimeout(() => {
                    setShowForgot(false);
                    setForgotStep(1);
                    setFormData({ ...formData, password: '' });
                    setOtpInput('');
                    setNewPassword('');
                    setConfirmPassword('');
                }, 1800);
            } else {
                setLocalError(data.error || 'Failed to update password.');
            }
        } catch {
            setLocalError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotBack = () => {
        setShowForgot(false);
        setForgotStep(1);
        setOtpInput('');
        setNewPassword('');
        setConfirmPassword('');
        setLocalError('');
        setLocalSuccess('');
    };

    const getForgotTitle = () => {
        if (forgotStep === 1) return 'Forgot Password';
        if (forgotStep === 2) return 'Enter OTP';
        return 'Set New Password';
    };

    return (
        <div className="auth-page">
            <div className="auth-panel-left">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <div className="auth-brand-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                        <span className="auth-brand-name">SportStore</span>
                    </div>
                    <h1 className="auth-brand-tagline">
                        Your Performance,<br />
                        <span className="auth-brand-tagline-accent">Our Passion.</span>
                    </h1>
                    <p className="auth-brand-desc">
                        Join thousands of athletes who trust SportStore for premium sports gear, authentic products, and lightning-fast delivery.
                    </p>
                    <div className="auth-features-list">
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Authentic premium sports brands guaranteed</span>
                        </div>
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Free delivery on orders over $100</span>
                        </div>
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="auth-feature-text">14-day easy returns &amp; exchanges</span>
                        </div>
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Exclusive member deals &amp; early access</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel-right">
                <div className="auth-form-wrapper">

                    {!showForgot ? (
                        <>
                            <div className="auth-tabs">
                                <button
                                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(true); clearMessages(); }}
                                >
                                    Login
                                </button>
                                <button
                                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(false); clearMessages(); }}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <div className="auth-form-header">
                                <h2 className="auth-form-title">
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="auth-form-subtitle">
                                    {isLogin
                                        ? 'Sign in to access your orders and favorites.'
                                        : 'Join SportStore and start shopping today.'}
                                </p>
                            </div>

                            {message && (
                                <div className={`auth-message ${message.type}`}>
                                    {message.type === 'error' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                    {message.text}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="auth-input-group">
                                    <label className="auth-input-label">Full Name</label>
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={changeHandler}
                                        type="text"
                                        className="auth-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label className="auth-input-label">Email Address</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={changeHandler}
                                    type="email"
                                    className="auth-input"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-input-label">Password</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={changeHandler}
                                        type={showPassword ? 'text' : 'password'}
                                        className="auth-input"
                                        placeholder="Enter your password"
                                        style={{ paddingRight: 44 }}
                                    />
                                    <span
                                        className="auth-input-icon"
                                        onClick={() => setShowPassword(p => !p)}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="auth-forgot-link">
                                    <span onClick={() => { setShowForgot(true); clearMessages(); }}>
                                        Forgot your password?
                                    </span>
                                </div>
                            )}

                            <div className="auth-terms-row">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    checked={agreedToTerms}
                                    onChange={changeHandler}
                                />
                                <label className="auth-terms-text" htmlFor="agreeToTerms">
                                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                                </label>
                            </div>

                            <button
                                className="auth-submit-btn"
                                onClick={isLogin ? handleLogin : handleSignup}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>

                            <div className="auth-toggle-row">
                                {isLogin ? (
                                    <>Don&apos;t have an account? <span onClick={() => { setIsLogin(false); clearMessages(); }}>Sign up free</span></>
                                ) : (
                                    <>Already have an account? <span onClick={() => { setIsLogin(true); clearMessages(); }}>Sign in</span></>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="auth-forgot-header">
                                <button className="auth-back-btn" onClick={handleForgotBack}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                </button>
                                <h2 className="auth-forgot-title">{getForgotTitle()}</h2>
                            </div>

                            <div className="auth-step-indicator">
                                <div className={`auth-step-dot ${forgotStep >= 1 ? 'active' : ''} ${forgotStep > 1 ? 'completed' : ''}`}>
                                    {forgotStep > 1 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : '1'}
                                </div>
                                <div className={`auth-step-line ${forgotStep > 1 ? 'completed' : ''} ${forgotStep >= 2 ? 'active' : ''}`} />
                                <div className={`auth-step-dot ${forgotStep >= 2 ? 'active' : ''} ${forgotStep > 2 ? 'completed' : ''}`}>
                                    {forgotStep > 2 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : '2'}
                                </div>
                                <div className={`auth-step-line ${forgotStep > 2 ? 'completed' : ''} ${forgotStep >= 3 ? 'active' : ''}`} />
                                <div className={`auth-step-dot ${forgotStep >= 3 ? 'active' : ''}`}>3</div>
                            </div>

                            {localError && (
                                <div className="auth-message error">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    {localError}
                                </div>
                            )}
                            {localSuccess && (
                                <div className="auth-message success">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    {localSuccess}
                                </div>
                            )}

                            {forgotStep === 1 && (
                                <>
                                    <p className="auth-forgot-desc">
                                        Enter your email address and we&apos;ll send you a one-time password to reset your account.
                                    </p>
                                    <div className="auth-input-group">
                                        <label className="auth-input-label">Email Address</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={changeHandler}
                                            type="email"
                                            className="auth-input"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <button className="auth-submit-btn" onClick={handleSendOTP} disabled={loading}>
                                        {loading ? <div className="spinner" /> : <>Send OTP <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></>}
                                    </button>
                                </>
                            )}

                            {forgotStep === 2 && (
                                <>
                                    <p className="auth-forgot-desc">
                                        A 6-digit OTP has been sent to <strong>{formData.email}</strong>. Enter it below to verify.
                                    </p>
                                    <div className="auth-input-group">
                                        <label className="auth-input-label">OTP Code</label>
                                        <input
                                            type="text"
                                            value={otpInput}
                                            onChange={(e) => setOtpInput(e.target.value)}
                                            className="auth-input"
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                        />
                                    </div>
                                    <button className="auth-submit-btn" onClick={handleVerifyOTP} disabled={loading}>
                                        {loading ? <div className="spinner" /> : <>Verify &amp; Continue <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></>}
                                    </button>
                                </>
                            )}

                            {forgotStep === 3 && (
                                <>
                                    <p className="auth-forgot-desc">
                                        OTP verified! Set a new secure password for your account.
                                    </p>
                                    <div className="auth-input-group">
                                        <label className="auth-input-label">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="auth-input"
                                            placeholder="At least 6 characters"
                                        />
                                    </div>
                                    <div className="auth-input-group">
                                        <label className="auth-input-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="auth-input"
                                            placeholder="Re-enter your password"
                                        />
                                    </div>
                                    <button className="auth-submit-btn" onClick={handleUpdatePassword} disabled={loading}>
                                        {loading ? <div className="spinner" /> : <>Update Password <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></>}
                                    </button>
                                </>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
