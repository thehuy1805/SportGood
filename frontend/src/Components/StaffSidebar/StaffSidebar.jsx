import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import './StaffSidebar.css';

const StaffSidebar = ({ children }) => {
    const { role, logout, userName } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        {
            path: '/staff/manage-orders',
            label: 'Orders',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            path: '/staff/manage-inventory',
            label: 'Inventory',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            )
        },
    ];

    return (
        <div className="staff-layout">
            {/* Top Header Bar */}
            <header className="staff-topbar">
                <div className="staff-topbar-left">
                    <div className="staff-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <span className="staff-brand">SportStore</span>
                    <span className="staff-role-badge">Staff</span>
                </div>
                <div className="staff-topbar-right">
                    <div className="staff-user-info">
                        <div className="staff-user-avatar">
                            {userName ? userName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="staff-user-name">{userName || 'Staff Member'}</span>
                    </div>
                    <button className="staff-logout-btn" onClick={() => { logout(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            {/* Sidebar + Content */}
            <div className="staff-body">
                {/* Sidebar */}
                <aside className="staff-sidebar">
                    <nav className="staff-sidebar-nav">
                        <div className="staff-sidebar-section-label">Navigation</div>
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`staff-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <div className="staff-sidebar-item-icon">{item.icon}</div>
                                <span className="staff-sidebar-item-text">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="staff-sidebar-footer">
                        <div className="staff-sidebar-item staff-sidebar-item--info">
                            <div className="staff-sidebar-item-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <span className="staff-sidebar-item-text" style={{ fontSize: 11, color: '#94a3b8' }}>
                                Staff Panel v1.0
                            </span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="staff-main">
                    <div className="staff-content-wrapper">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffSidebar;
