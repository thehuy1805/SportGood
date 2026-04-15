import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import footer_logo from '../Assets/main_logo.jpg';
import instagram_icon from '../Assets/icon_instagram.png';
import facebook_icon from '../Assets/facebook_icon.png';
import tiktok_icon from '../Assets/tiktok_icon.png';
import { AuthContext } from '../../Context/AuthContext';

const Footer = () => {
    const { role } = useContext(AuthContext);
    const isAdminOrStaff = role === 'admin' || role === 'staff';
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    if (isAdminOrStaff) return null;

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer className="footer">
            {/* Wave SVG */}
            <div className="footer-wave">
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#0d1117" />
                </svg>
            </div>

            <div className="footer-body">
                <div className="footer-inner">
                    {/* Brand */}
                    <div className="fc fc-brand">
                        <div className="fc-logo">
                            <img src={footer_logo} alt="Sports Stores" />
                            <div>
                                <span className="fc-logo-name">SPORTS</span>
                                <span className="fc-logo-sub">STORES</span>
                            </div>
                        </div>
                        <p className="fc-about">
                            Your ultimate destination for premium sports gear — top quality, unlimited style, every day.
                        </p>
                        <div className="fc-socials">
                            <a href="https://www.instagram.com/huypu_1805/" target="_blank" rel="noopener noreferrer" className="fc-social-btn" aria-label="Instagram">
                                <img src={instagram_icon} alt="Instagram" />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=100007777727900" target="_blank" rel="noopener noreferrer" className="fc-social-btn" aria-label="Facebook">
                                <img src={facebook_icon} alt="Facebook" />
                            </a>
                            <a href="https://www.tiktok.com/@huypham_1805" target="_blank" rel="noopener noreferrer" className="fc-social-btn" aria-label="TikTok">
                                <img src={tiktok_icon} alt="TikTok" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="fc fc-links">
                        <h4 className="fc-title">Navigation</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/men">Men</Link></li>
                            <li><Link to="/women">Women</Link></li>
                            <li><Link to="/sport-equipment">Sports Equipment</Link></li>
                            <li><Link to="/cart">Cart</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="fc fc-contact">
                        <h4 className="fc-title">Contact</h4>
                        <div className="fc-contact-list">
                            <div className="fc-contact-row">
                                <span className="fc-contact-icon">📍</span>
                                <span>123 Sports Ave, District 1, HCMC</span>
                            </div>
                            <div className="fc-contact-row">
                                <span className="fc-contact-icon">📞</span>
                                <span>+84 123 456 789</span>
                            </div>
                            <div className="fc-contact-row">
                                <span className="fc-contact-icon">✉️</span>
                                <span>contact@sportsstores.com</span>
                            </div>
                            <div className="fc-contact-row">
                                <span className="fc-contact-icon">🕐</span>
                                <span>Mon – Sat: 8:00 AM – 9:00 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="fc fc-newsletter">
                        <h4 className="fc-title">Stay Updated</h4>
                        <p className="fc-newsletter-desc">Subscribe to get exclusive deals and the latest news.</p>
                        {subscribed ? (
                            <div className="fc-subscribed">
                                <span>✅</span> Thank you for subscribing!
                            </div>
                        ) : (
                            <form className="fc-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Your email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="fc-input"
                                    required
                                />
                                <button type="submit" className="fc-submit">Subscribe</button>
                            </form>
                        )}
                        <div className="fc-badges">
                            <span className="fc-badge">🔒 SSL Secured</span>
                            <span className="fc-badge">🚚 Free Shipping</span>
                            <span className="fc-badge">↩️ 30-Day Returns</span>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} <strong>Sports Stores</strong>. All rights reserved.</span>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <span>·</span>
                        <a href="#">Terms of Service</a>
                        <span>·</span>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
