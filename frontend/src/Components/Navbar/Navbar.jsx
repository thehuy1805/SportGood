import React, { useContext, useRef, useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../Assets/main_logo.jpg';
import cart_icon from '../Assets/cart_icon.png';
import user_icon from '../Assets/user_icon.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { AuthContext } from '../../Context/AuthContext';
import { User, Ruler, ShoppingBag, LogOut, Menu, X, Search, Heart, Home, LayoutGrid, Zap, UserCircle, MapPin } from 'lucide-react';

const Navbar = () => {
    const { getTotalCartItems, getWishlistCount } = useContext(ShopContext);
    const { logout, userName, userId } = useContext(AuthContext);
    const userMenuRef = useRef();
    const menuRef = useRef(); // wrapper dropdown
    const [isLoading, setIsLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchInputRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    const handleLogout = () => {
        logout();
        window.location.replace('/');
    };

    // Bật/tắt overlay tìm kiếm
    const toggleSearch = () => {
        setSearchOpen(!searchOpen);
        if (!searchOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setTimeout(() => {
                if (searchInputRef.current) searchInputRef.current.focus();
            }, 100);
        }
    };

    // Đóng user menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };
        if (searchOpen || userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchOpen, userMenuOpen]);

    // Xử lý phím escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);

    // Logic tìm kiếm
    const { all_product } = useContext(ShopContext);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length === 0) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = all_product
            .filter(product =>
                product.name.toLowerCase().includes(lowerQuery) ||
                (product.detailedCategory && product.detailedCategory.toLowerCase().includes(lowerQuery)) ||
                (product.generalCategory && product.generalCategory.toLowerCase().includes(lowerQuery))
            )
            .slice(0, 8);

        setSearchResults(results);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchOpen(false);
            setSearchQuery('');
            setSearchResults([]);
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleResultClick = (product) => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/product/${generateSlug(product.name)}`);
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
                        <button className="icon-btn search-btn" aria-label="Search" onClick={toggleSearch}>
                            <Search size={20} />
                        </button>

                        {/* Wishlist */}
                        <NavLink to="/wishlist" className="icon-btn wishlist-btn" aria-label="Wishlist">
                            <Heart size={20} />
                            {getWishlistCount() > 0 && (
                                <span className="badge-dot wishlist-badge">{getWishlistCount()}</span>
                            )}
                        </NavLink>

                        {/* User dropdown */}
                        <div className="user-dropdown" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`profile-button ${userMenuOpen ? 'active' : ''}`}
                                onMouseEnter={() => setUserMenuOpen(true)}
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
                                className={`user-menu ${userMenuOpen ? 'user-menu-visible' : ''}`}
                                onMouseEnter={() => setUserMenuOpen(true)}
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
                                                setUserMenuOpen(false);
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
                                                    setUserMenuOpen(false);
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
                                                    setUserMenuOpen(false);
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
                                                    setUserMenuOpen(false);
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
                                                    setUserMenuOpen(false);
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

            {/* Search Overlay */}
            {searchOpen && (
                <div className="search-overlay" ref={searchRef}>
                    <div className="search-overlay-content">
                        <form onSubmit={handleSearchSubmit} className="search-form">
                            <Search size={20} className="search-form-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="search-input"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                autoFocus
                            />
                            <button type="button" className="search-close-btn" onClick={toggleSearch}>
                                <X size={20} />
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="search-results-dropdown">
                                {searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(product)}
                                    >
                                        <img src={product.image} alt={product.name} className="search-result-img" />
                                        <div className="search-result-info">
                                            <span className="search-result-name">{product.name}</span>
                                            <span className="search-result-category">
                                                {product.generalCategory} / {product.detailedCategory}
                                            </span>
                                        </div>
                                        <span className="search-result-price">${product.new_price}</span>
                                    </div>
                                ))}
                                <div className="search-result-footer" onClick={handleSearchSubmit}>
                                    <Search size={14} />
                                    <span>Search for "{searchQuery}"</span>
                                </div>
                            </div>
                        )}

                        {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                            <div className="search-no-results">
                                <Search size={32} />
                                <p>No products found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
