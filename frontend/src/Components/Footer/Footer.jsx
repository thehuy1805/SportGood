import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import footer_logo from '../Assets/main_logo.jpg';
import instagram_icon from '../Assets/icon_instagram.png';
import facebook_icon from '../Assets/facebook_icon.png';
import tiktok_icon from '../Assets/tiktok_icon.png';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../Context/AuthContext';

const Footer = () => {
    const { role } = useContext(AuthContext);
    const isAdminOrStaff = role === 'admin' || role === 'staff';

    if (isAdminOrStaff) return null;

    return (
        <footer className="footer">
            {/* Top gradient bar */}
            <div className="footer-top-bar"></div>

            <div className="footer-container">
                {/* Main Grid */}
                <div className="footer-grid">
                    {/* Column 1: Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-img">
                                <img src={footer_logo} alt="Sports Stores" />
                            </div>
                            <div className="footer-logo-text">
                                <span className="footer-logo-brand">SPORTS</span>
                                <span className="footer-logo-store">STORES</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            Your ultimate destination for premium sports gear, apparel, and equipment. 
                            Gear up and push your limits every day.
                        </p>
                        <div className="footer-contact-items">
                            <div className="footer-contact-item">
                                <MapPin size={16} className="footer-contact-icon" />
                                <span>123 Sports Ave, District 1, HCMC</span>
                            </div>
                            <div className="footer-contact-item">
                                <Phone size={16} className="footer-contact-icon" />
                                <span>+84 123 456 789</span>
                            </div>
                            <div className="footer-contact-item">
                                <Mail size={16} className="footer-contact-icon" />
                                <span>contact@sportsstores.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <Clock size={16} className="footer-contact-icon" />
                                <span>Mon - Sat: 8:00 AM - 9:00 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Newsletter */}
                    <div className="footer-column footer-newsletter">
                        <h3 className="footer-heading">Stay Updated</h3>
                        <p className="footer-newsletter-text">
                            Subscribe to get special offers, free giveaways, and exclusive deals.
                        </p>
                        <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="footer-newsletter-input"
                            />
                            <button type="submit" className="footer-newsletter-btn">
                                <ArrowRight size={20} />
                            </button>
                        </form>
                        <div className="footer-social">
                            <span className="footer-social-label">Follow Us</span>
                            <div className="footer-social-icons">
                                <a
                                    href="https://www.instagram.com/huypu_1805/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-icon"
                                    aria-label="Instagram"
                                >
                                    <img src={instagram_icon} alt="Instagram" />
                                </a>
                                <a
                                    href="https://www.facebook.com/profile.php?id=100007777727900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-icon"
                                    aria-label="Facebook"
                                >
                                    <img src={facebook_icon} alt="Facebook" />
                                </a>
                                <a
                                    href="https://www.tiktok.com/@huypham_1805"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-icon"
                                    aria-label="TikTok"
                                >
                                    <img src={tiktok_icon} alt="TikTok" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-divider"></div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} <strong>Sports Stores</strong>. All rights reserved.
                    </p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <span className="footer-dot"></span>
                        <a href="#">Terms of Service</a>
                        <span className="footer-dot"></span>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
