import React, { useState, useEffect } from 'react';
import './CSS/AddressBookPage.css';

const LABEL_OPTIONS = ['Home', 'Office', 'Other'];

const AddressBookPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
                const res = await fetch(`${API_BASE_URL}/get-profile`, {
                headers: { 'auth-token': localStorage.getItem('auth-token') }
            });
            const data = await res.json();
            if (data.success) {
                setAddresses(data.user.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            label: 'Home',
            fullName: '',
            phone: '',
            addressLine: '',
            city: '',
            province: '',
            postalCode: '',
            isDefault: addresses.length === 0
        });
        setShowModal(true);
    };

    const openEditModal = (address) => {
        setEditingId(address._id);
        setFormData({
            label: address.label || 'Home',
            fullName: address.fullName || '',
            phone: address.phone || '',
            addressLine: address.addressLine || '',
            city: address.city || '',
            province: address.province || '',
            postalCode: address.postalCode || '',
            isDefault: address.isDefault || false
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setMessage(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.addressLine) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const url = editingId
                ? `${API_BASE_URL}/update-address/${editingId}`
                : `${API_BASE_URL}/add-address`;
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses);
                setMessage({ type: 'success', text: editingId ? 'Address updated successfully!' : 'Address added successfully!' });
                setTimeout(closeModal, 1200);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save address.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        setDeletingId(addressId);
        try {
            const res = await fetch(`${API_BASE_URL}/delete-address/${addressId}`, {
                method: 'DELETE',
                headers: { 'auth-token': localStorage.getItem('auth-token') }
            });
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses);
                setMessage({ type: 'success', text: 'Address deleted successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to delete address.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/set-default-address/${addressId}`, {
                method: 'PUT',
                headers: { 'auth-token': localStorage.getItem('auth-token') }
            });
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const getLabelIcon = (label) => {
        if (label === 'Home') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            );
        }
        if (label === 'Office') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="address-book-page">
                <div className="address-book-inner">
                    <div className="address-book-loading">
                        <div className="address-book-spinner" />
                        <span>Loading addresses...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="address-book-page">
            <div className="address-book-inner">

                {/* Header */}
                <div className="address-book-header">
                    <div className="address-book-title-row">
                        <div className="address-book-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div>
                            <h1>Address Book</h1>
                            <p>Manage your delivery addresses</p>
                        </div>
                    </div>
                    <button className="address-add-btn" onClick={openAddModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add New Address
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`address-book-message ${message.type}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {message.type === 'success' ? (
                                <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                                <>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </>
                            )}
                        </svg>
                        {message.text}
                    </div>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                    <div className="address-book-empty">
                        <div className="address-book-empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <h2>No Addresses Yet</h2>
                        <p>Add your first delivery address to get started.</p>
                        <button className="address-add-btn" onClick={openAddModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Your First Address
                        </button>
                    </div>
                ) : (
                    <div className="address-book-grid">
                        {addresses.map(address => (
                            <div key={address._id} className={`address-card ${address.isDefault ? 'address-card-default' : ''}`}>
                                {address.isDefault && (
                                    <div className="address-default-badge">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Default
                                    </div>
                                )}
                                <div className="address-card-header">
                                    <div className="address-label">
                                        {getLabelIcon(address.label)}
                                        <span>{address.label || 'Address'}</span>
                                    </div>
                                </div>
                                <div className="address-card-body">
                                    <div className="address-field">
                                        <span className="address-field-name">{address.fullName}</span>
                                    </div>
                                    <div className="address-field">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        <span>{address.phone}</span>
                                    </div>
                                    <div className="address-field">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>{address.addressLine}{address.city ? `, ${address.city}` : ''}{address.province ? `, ${address.province}` : ''}</span>
                                    </div>
                                    {address.postalCode && (
                                        <div className="address-field">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                                <line x1="2" y1="9" x2="22" y2="9"></line>
                                            </svg>
                                            <span>{address.postalCode}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="address-card-footer">
                                    {!address.isDefault && (
                                        <button
                                            className="address-set-default-btn"
                                            onClick={() => handleSetDefault(address._id)}
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                    <div className="address-card-actions">
                                        <button
                                            className="address-edit-btn"
                                            onClick={() => openEditModal(address)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            className="address-delete-btn"
                                            onClick={() => handleDelete(address._id)}
                                            disabled={deletingId === address._id}
                                        >
                                            {deletingId === address._id ? (
                                                <div className="address-delete-spinner" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="address-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="address-modal">
                        <div className="address-modal-header">
                            <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                            <button className="address-modal-close" onClick={closeModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {message && (
                            <div className={`address-book-message ${message.type}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {message.type === 'success' ? (
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    ) : (
                                        <>
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </>
                                    )}
                                </svg>
                                {message.text}
                            </div>
                        )}

                        <form className="address-modal-body" onSubmit={handleSubmit}>
                            <div className="address-form-group">
                                <label>Address Label</label>
                                <div className="address-label-options">
                                    {LABEL_OPTIONS.map(label => (
                                        <button
                                            key={label}
                                            type="button"
                                            className={`address-label-chip ${formData.label === label ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, label }))}
                                        >
                                            {getLabelIcon(label)}
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="address-form-row">
                                <div className="address-form-group">
                                    <label>Full Name <span>*</span></label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleFormChange}
                                        placeholder="Recipient's full name"
                                        required
                                    />
                                </div>
                                <div className="address-form-group">
                                    <label>Phone Number <span>*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        placeholder="Phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="address-form-group">
                                <label>Address Line <span>*</span></label>
                                <input
                                    type="text"
                                    name="addressLine"
                                    value={formData.addressLine}
                                    onChange={handleFormChange}
                                    placeholder="Street address, apartment, suite, etc."
                                    required
                                />
                            </div>

                            <div className="address-form-row address-form-row-3">
                                <div className="address-form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleFormChange}
                                        placeholder="City"
                                    />
                                </div>
                                <div className="address-form-group">
                                    <label>Province</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleFormChange}
                                        placeholder="Province / State"
                                    />
                                </div>
                                <div className="address-form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleFormChange}
                                        placeholder="Postal code"
                                    />
                                </div>
                            </div>

                            <div className="address-form-group address-form-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleFormChange}
                                    />
                                    <span>Set as default delivery address</span>
                                </label>
                            </div>

                            <div className="address-modal-footer">
                                <button type="button" className="address-modal-cancel" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="address-modal-save" disabled={saving}>
                                    {saving ? (
                                        <div className="address-modal-spinner" />
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            {editingId ? 'Save Changes' : 'Add Address'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;
