import React from 'react';
import { Navigate } from 'react-router-dom';

// Thành phần bảo vệ tuyến đường cho người dùng
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

// Thành phần bảo vệ tuyến đường cho nhân viên
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

// Thành phần bảo vệ tuyến đường cho quản trị viên
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