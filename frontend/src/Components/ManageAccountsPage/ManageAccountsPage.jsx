import React, { useState, useEffect } from 'react';
import './ManageAccountsPage.css';
import API_BASE_URL from '../../config';

const ManageAccountsPage = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/get-users`, {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setEditingUser({});
        setShowModal(true);
    };

    const handleUpdate = (user) => {
        setFormData({ name: user.name, email: user.email, password: user.password || '', role: user.role });
        setEditingUser(user);
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this account? This action cannot be undone.')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/delete-account/${userId}`, {
                method: 'DELETE',
                headers: { 'auth-token': localStorage.getItem('auth-token') }
            });
            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId));
                alert('Account deleted successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingUser._id) {
                response = await fetch(`${API_BASE_URL}/admin/update-account/${editingUser._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'auth-token': localStorage.getItem('auth-token') },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/admin/create-account`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'auth-token': localStorage.getItem('auth-token') },
                    body: JSON.stringify(formData)
                });
            }
            const data = await response.json();
            if (response.ok) {
                if (!editingUser._id) {
                    const refreshed = await fetch(`${API_BASE_URL}/admin/get-users`, {
                        headers: { 'auth-token': localStorage.getItem('auth-token') }
                    }).then(r => r.json());
                    setUsers(refreshed);
                } else {
                    setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...formData } : u));
                }
                alert(editingUser._id ? 'Account updated!' : 'Account created!');
                setShowModal(false);
            } else {
                alert(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    };

    const getRoleBadgeClass = (role) => {
        const classes = { admin: 'admin', staff: 'staff', user: 'user' };
        return classes[role] || 'user';
    };

    return (
        <div style={{ padding: '32px' }}>
            <div className="accounts-header">
                <div className="accounts-title">
                    <div className="accounts-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <h1>Account Management</h1>
                </div>
                <button className="admin-btn-primary" onClick={handleAdd}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Account
                </button>
            </div>

            <div className="accounts-card">
                <div className="admin-table-wrapper">
                    <table className="admin-table accounts-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="account-name">{user.name}</div>
                                        <div className="account-email">{user.email}</div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`admin-status ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-actions-row">
                                            <button className="admin-btn-warning" onClick={() => handleUpdate(user)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                            <button className="admin-btn-danger" onClick={() => handleDelete(user._id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="accounts-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="accounts-modal">
                        <div className="accounts-modal-header">
                            <h3 className="accounts-modal-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                </svg>
                                {editingUser._id ? 'Update Account' : 'Add New Account'}
                            </h3>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-input-group">
                                <label className="admin-label">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="admin-input" placeholder="Enter name" required />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="admin-input" placeholder="Enter email" required />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="admin-input" placeholder={editingUser._id ? 'Leave blank to keep current' : 'Enter password'} required={!editingUser._id} />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="admin-select">
                                    <option value="user">Customer</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div className="modal-form-actions">
                                <button type="submit" className="modal-submit-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    {editingUser._id ? 'Save Changes' : 'Create Account'}
                                </button>
                                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAccountsPage;
