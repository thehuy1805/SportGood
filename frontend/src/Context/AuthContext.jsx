import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    token: null,
    role: null,
    userId: null,
    userName: null, // Thêm userName vào AuthContext
    login: () => {},
    logout: () => {}
});

const AuthContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('auth-token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [userName, setUserName] = useState(localStorage.getItem('user-name')); // Thêm state userName
    const [userId, setUserId] = useState(localStorage.getItem('user-id'));

    useEffect(() => {
        const checkLoginStatus = async () => { 
            const storedToken = localStorage.getItem('auth-token');
            const storedRole = localStorage.getItem('role');
            const storedUserId = localStorage.getItem('user-id');
            const storedName = localStorage.getItem('user-name'); // Lấy userName từ local storage

            if (storedToken) {
                setIsLoggedIn(true);
                setToken(storedToken);
                setRole(storedRole);
                setUserId(storedUserId);
                setUserName(storedName); // Cập nhật userName
            } else {
                setIsLoggedIn(false);
                setToken(null);
                setRole(null);
                setUserId(null);
                setUserName(null); // Cập nhật userName
            }
        };

        checkLoginStatus();

        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const login = (token, role, id, name) => { // Cập nhật hàm login để nhận thêm name
        localStorage.setItem('auth-token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('user-id', id);
        localStorage.setItem('user-name', name); // Lưu name vào local storage
        setIsLoggedIn(true);
        setToken(token);
        setUserId(id);
        setRole(role);
        setUserName(name); // Cập nhật userName
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('role');
        localStorage.removeItem('user-id');
        localStorage.removeItem('user-name'); // Xóa userName khỏi local storage
        setIsLoggedIn(false);
        setToken(null);
        setRole(null);
        setUserId(null);
        setUserName(null); // Cập nhật userName
        
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, role, userId, userName, login, logout }}> 
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;