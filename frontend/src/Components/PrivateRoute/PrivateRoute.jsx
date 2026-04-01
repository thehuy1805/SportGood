import React from 'react';
import { Navigate } from 'react-router-dom';

// Component bảo vệ route cho user
export const UserRoute = ({ children }) => {
    const token = localStorage.getItem('auth-token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role !== 'user') {
        return <Navigate to="/" />;
    }

    return children;
};

// Component bảo vệ route cho staff
export const StaffRoute = ({ children }) => {
    const token = localStorage.getItem('auth-token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role !== 'staff') {
        return <Navigate to="/" />;
    }

    return children;
};

// Component bảo vệ route cho admin
export const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('auth-token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};