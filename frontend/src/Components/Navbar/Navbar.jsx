import React, { useContext, useRef, useState } from 'react';
import './Navbar.css';
import logo from '../Assets/main_logo.jpg';
import cart_icon from '../Assets/cart_icon.png';
import user_icon from '../Assets/user_icon.png';
import { NavLink } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { AuthContext } from '../../Context/AuthContext';
import { User, Ruler, ShoppingBag, LogOut, Menu, X, Search, Heart, Home, LayoutGrid, Zap, UserCircle, MapPin } from 'lucide-react';

const Navbar = () => {
    const { getTotalCartItems } = useContext(ShopContext);
    const { logout, userName, userId } = useContext(AuthContext);
    const userMenuRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    const userMenu_toggle = () => {
        userMenuRef.current.classList.toggle('user-menu-visible');
    };

    const handleLogout = () => {
        logout();
        window.location.replace('/');
    };

    const navLinks = [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/shop', label: 'Shop', icon: 'grid' },
        { to: '/men', label: 'Men', icon: 'user' },
        { to: '/women', label: 'Women', icon: 'heart' },
        { to: '/sport-equipment', label: 'Sports', icon: 'zap' },
    ];

    const getNavIcon = (icon) => {
        switch (icon) {
            case 'home': return <Home size={14} strokeWidth={2.5} />;
            case 'grid': return <LayoutGrid size={14} strokeWidth={2.5} />;
            case 'user': return <User size={14} strokeWidth={2.5} />;
            case 'heart': return <Heart size={14} strokeWidth={2.5} />;
            case 'zap': return <Zap size={14} strokeWidth={2.5} />;
            default: return null;
        }
    };

    return (
        <>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <header className="navbar">
                <div className="navbar-container">
                    {/* Left: Hamburger + Logo */}
                    <div className="navbar-left">
                        <button
                            className="hamburger"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className="nav-logo">
                            <div className="logo-image-wrapper">
                                <img src={logo} alt="Sports Stores Logo" />
                            </div>
                            <div className="logo-text">
                                <span className="logo-brand">SPORTS</span>
                                <span className="logo-store">STORES</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className={`nav-menu ${mobileMenuOpen ? 'nav-menu-open' : ''}`}>
                        <ul className="nav-menu-list">
                            {navLinks.map((link) => (
                                <li key={link.to} onClick={handleClick}>
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active-link' : ''}`
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="nav-link-icon">{getNavIcon(link.icon)}</span>
                                        <span className="nav-link-text">{link.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right: Actions */}
                    <div className="navbar-right">
                        {/* Search icon */}
                        <button className="icon-btn search-btn" aria-label="Search">
                            <Search size={20} />
                        </button>

                        {/* Wishlist */}
                        <NavLink to="/wishlist" className="icon-btn wishlist-btn" aria-label="Wishlist">
                            <Heart size={20} />
                            <span className="badge-dot"></span>
                        </NavLink>

                        {/* User dropdown */}
                        <div className="user-dropdown">
                            <button
                                onClick={userMenu_toggle}
                                className={`profile-button ${userMenuRef.current?.classList.contains('user-menu-visible') ? 'active' : ''}`}
                            >
                                <div className="profile-avatar">
                                    <img src={user_icon} alt="User" />
                                </div>
                                <div className="profile-info">
                                    <span className="profile-label">
                                        {userName ? userName : 'Guest'}
                                    </span>
                                    <span className="profile-sublabel">
                                        {userName ? 'Account' : 'Login Here'}
                                    </span>
                                </div>
                                <div className="profile-arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </button>

                            <div
                                ref={userMenuRef}
                                className="user-menu"
                            >
                                <div className="menu-header">
                                    <User className="menu-icon" />
                                    <div className="menu-header-info">
                                        <span>{userName ? userName : 'My Account'}</span>
                                        {userName && <small>Welcome back!</small>}
                                    </div>
                                </div>
                                <div className="menu-body">
                                    {!localStorage.getItem('auth-token') ? (
                                        <NavLink
                                            to='/login'
                                            className="menu-item menu-item-primary"
                                            onClick={() => {
                                                userMenu_toggle();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut className="menu-icon" />
                                            <span>Login / Register</span>
                                        </NavLink>
                                    ) : (
                                        <>
                                            <NavLink
                                                to='/order-history'
                                                className="menu-item"
                                                onClick={() => {
                                                    userMenu_toggle();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <ShoppingBag className="menu-icon" />
                                                <span>Order Information</span>
                                            </NavLink>
                                            <NavLink
                                                to='/my-profile'
                                                className="menu-item"
                                                onClick={() => {
                                                    userMenu_toggle();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <UserCircle className="menu-icon" />
                                                <span>My Profile</span>
                                            </NavLink>
                                            <NavLink
                                                to='/address-book'
                                                className="menu-item"
                                                onClick={() => {
                                                    userMenu_toggle();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <MapPin className="menu-icon" />
                                                <span>Address Book</span>
                                            </NavLink>
                                            <NavLink
                                                to='/size-guide'
                                                className="menu-item"
                                                onClick={() => {
                                                    userMenu_toggle();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <Ruler className="menu-icon" />
                                                <span>Size Guide</span>
                                            </NavLink>
                                            <div className="menu-divider"></div>
                                            <button onClick={handleLogout} className="menu-item menu-item-logout">
                                                <LogOut className="menu-icon" />
                                                <span>Log Out</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="cart-wrapper">
                            <NavLink to='/cart' className="cart-button">
                                <img src={cart_icon} alt="Cart" />
                                {getTotalCartItems() > 0 && (
                                    <span className="cart-badge">{getTotalCartItems()}</span>
                                )}
                                <span className="cart-label">Cart</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}
        </>
    );
};

export default Navbar;
