import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/CheckoutPage.css';
import cardIcon from '../Components/Assets/img_card.png';
import gpayIcon from '../Components/Assets/gpayIcon.svg';
import bankIcon from '../Components/Assets/bankIcon.svg';
import codIcon from '../Components/Assets/img_cod.png';

const CheckoutPage = () => {
    const { cartItems, getTotalCartAmount, all_product, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    const products = [];
    for (const itemId in cartItems) {
        const product = all_product.find(p => p.id === Number(itemId));
        if (product) {
            for (const size in cartItems[itemId]) {
                products.push({
                    productId: product.id,
                    size: size,
                    quantity: cartItems[itemId][size],
                    price: product.new_price
                });
            }
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        paymentMethod: 'card',
        cardNumber: '',
        expiry: '',
        cvc: '',
        gpayName: '',
        gpayEmail: '',
        billingSameAsShipping: true,
        bank: 'MB bank',
        accountNumber: '',
        accountName: '',
        transferContent: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch('http://localhost:4000/get-profile', {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                const data = await res.json();
                if (data.success) {
                    const userAddresses = data.user.addresses || [];
                    setAddresses(userAddresses);
                    const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr._id);
                        setFormData(prev => ({
                            ...prev,
                            name: defaultAddr.fullName || '',
                            phone: defaultAddr.phone || '',
                            address: `${defaultAddr.addressLine || ''}${defaultAddr.city ? `, ${defaultAddr.city}` : ''}${defaultAddr.province ? `, ${defaultAddr.province}` : ''}${defaultAddr.postalCode ? ` ${defaultAddr.postalCode}` : ''}`.trim(),
                        }));
                    } else {
                        setShowNewAddressForm(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setShowNewAddressForm(true);
            }
        };
        fetchAddresses();
    }, []);

    const handleSelectAddress = (address) => {
        setSelectedAddressId(address._id);
        setShowNewAddressForm(false);
        setFormData(prev => ({
            ...prev,
            name: address.fullName || '',
            phone: address.phone || '',
            address: `${address.addressLine || ''}${address.city ? `, ${address.city}` : ''}${address.province ? `, ${address.province}` : ''}${address.postalCode ? ` ${address.postalCode}` : ''}`.trim(),
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "expiry" && value.length === 2 && !value.includes("/")) {
            setFormData(prev => ({
                ...prev,
                [name]: value + "/"
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    products: products,
                    shippingInfo: {
                        name: formData.name,
                        address: formData.address,
                        phone: formData.phone,
                        email: formData.email
                    },
                    paymentMethod: formData.paymentMethod
                })
            });

            if (response.ok) {
                clearCart();
                const data = await response.json();
                const orderId = data.orderId;
                navigate(`/order-confirmation?orderId=${orderId}`);
            } else {
                const errorData = await response.json();
                alert("Thanh toán thất bại: " + errorData.error);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu thanh toán:', error);
            alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.paymentMethod === 'bank') {
            const { bank, accountNumber } = formData;

            switch (bank) {
                case 'MB bank':
                    if (!/^\d{9,13}$/.test(accountNumber)) {
                        newErrors.accountNumber = 'MB bank account number must be from 9 to 13 digits';
                    }
                    break;
                case 'Agribank':
                    if (!/^\d{13}$/.test(accountNumber)) {
                        newErrors.accountNumber = 'Agribank account number must have 13 digits';
                    }
                    break;
                case 'Techcombank':
                    if (!/^\d{14}$/.test(accountNumber)) {
                        newErrors.accountNumber = 'Techcombank account number must have 14 digits';
                    }
                    break;
                case 'Vietcombank':
                    if (!/^\d{13}$/.test(accountNumber)) {
                        newErrors.accountNumber = 'Vietcombank account number must have 13 digits';
                    }
                    break;
                default:
                    break;
            }
        }

        return newErrors;
    };

    const total = getTotalCartAmount();

    return (
        <div className="checkout-page">
            <div className="checkout-page-inner">
                {/* Header */}
                <div className="checkout-header">
                    <button
                        className="checkout-back-btn"
                        onClick={() => navigate('/cart')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Cart
                    </button>
                </div>

                {/* Steps */}
                <div className="checkout-steps">
                    <div className="checkout-step completed">
                        <div className="checkout-step-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span className="checkout-step-label">Cart</span>
                    </div>
                    <div className="checkout-step-line completed" />
                    <div className="checkout-step active">
                        <div className="checkout-step-circle">2</div>
                        <span className="checkout-step-label">Checkout</span>
                    </div>
                    <div className="checkout-step-line" />
                    <div className="checkout-step">
                        <div className="checkout-step-circle">3</div>
                        <span className="checkout-step-label">Confirm</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    {/* Left: Form */}
                    <div className="checkout-form-col">
                        <form onSubmit={handleSubmit}>
                            <div className="form-card">
                                {/* Saved Addresses */}
                                {addresses.length > 0 && (
                                    <div className="saved-addresses-section">
                                        <div className="saved-addresses-title">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            Select Delivery Address
                                        </div>
                                        <div className="saved-addresses-list">
                                            {addresses.map(addr => (
                                                <div
                                                    key={addr._id}
                                                    className={`saved-address-item ${selectedAddressId === addr._id ? 'selected' : ''}`}
                                                    onClick={() => handleSelectAddress(addr)}
                                                >
                                                    <div className="saved-address-radio">
                                                        <div className={`radio-dot ${selectedAddressId === addr._id ? 'active' : ''}`} />
                                                    </div>
                                                    <div className="saved-address-content">
                                                        <div className="saved-address-header">
                                                            <span className="saved-address-label">{addr.label}</span>
                                                            {addr.isDefault && <span className="saved-address-default">Default</span>}
                                                        </div>
                                                        <span className="saved-address-name">{addr.fullName}</span>
                                                        <span className="saved-address-phone">{addr.phone}</span>
                                                        <span className="saved-address-line">
                                                            {addr.addressLine}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className={`saved-address-item add-new ${showNewAddressForm ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedAddressId('');
                                                    setShowNewAddressForm(true);
                                                    setFormData(prev => ({ ...prev, name: '', phone: '', address: '' }));
                                                }}
                                            >
                                                <div className="saved-address-radio">
                                                    <div className={`radio-dot ${showNewAddressForm ? 'active' : ''}`} />
                                                </div>
                                                <div className="saved-address-content">
                                                    <span className="saved-address-add-icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        </svg>
                                                    </span>
                                                    <span className="saved-address-add-text">Enter a new address</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shipping Info */}
                                <div className="form-section">
                                    <div className="form-section-title">
                                        <div className="form-section-title-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                        </div>
                                        {showNewAddressForm || addresses.length === 0 ? 'Enter Delivery Address' : 'Shipping Information'}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                placeholder="Nguyen Van A"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                placeholder="0912 345 678"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row full">
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row full">
                                        <div className="form-group">
                                            <label htmlFor="address">Delivery Address</label>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                placeholder="123 Le Loi, Ward 4, District 1, Ho Chi Minh City"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="form-section">
                                    <div className="form-section-title">
                                        <div className="form-section-title-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                <line x1="1" y1="10" x2="23" y2="10"></line>
                                            </svg>
                                        </div>
                                        Payment Method
                                    </div>

                                    <div className="payment-methods">
                                        <div
                                            className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                        >
                                            <img src={cardIcon} alt="Card" />
                                            <span className="payment-method-name">Credit Card</span>
                                        </div>
                                        <div
                                            className={`payment-method ${formData.paymentMethod === 'ViettelMoney' ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ViettelMoney' }))}
                                        >
                                            <img src={gpayIcon} alt="Viettel Money" />
                                            <span className="payment-method-name">Viettel Money</span>
                                        </div>
                                        <div
                                            className={`payment-method ${formData.paymentMethod === 'bank' ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                                        >
                                            <img src={bankIcon} alt="Bank Transfer" />
                                            <span className="payment-method-name">Bank Transfer</span>
                                        </div>
                                        <div
                                            className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                                        >
                                            <img src={codIcon} alt="Cash on Delivery" />
                                            <span className="payment-method-name">COD</span>
                                        </div>
                                    </div>

                                    {formData.paymentMethod === 'card' && (
                                        <div className="payment-details-card">
                                            <div className="form-row full" style={{ marginBottom: 14 }}>
                                                <div className="form-group">
                                                    <label htmlFor="cardNumber">Card Number</label>
                                                    <div className="card-number-input">
                                                        <span className="card-type-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                                <line x1="1" y1="10" x2="23" y2="10"></line>
                                                            </svg>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="cardNumber"
                                                            name="cardNumber"
                                                            placeholder="1234 1234 1234 1234"
                                                            value={formData.cardNumber}
                                                            onChange={handleChange}
                                                            maxLength={19}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="expiry-cvc-row">
                                                <div className="form-group">
                                                    <label htmlFor="expiry">Expiry</label>
                                                    <input
                                                        type="text"
                                                        id="expiry"
                                                        name="expiry"
                                                        placeholder="MM/YY"
                                                        value={formData.expiry}
                                                        onChange={handleChange}
                                                        maxLength={5}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="cvc">CVC</label>
                                                    <input
                                                        type="text"
                                                        id="cvc"
                                                        name="cvc"
                                                        placeholder="123"
                                                        value={formData.cvc}
                                                        onChange={handleChange}
                                                        maxLength={4}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="billing-checkbox">
                                                <input
                                                    type="checkbox"
                                                    id="billingSameAsShipping"
                                                    name="billingSameAsShipping"
                                                    checked={formData.billingSameAsShipping}
                                                    onChange={handleChange}
                                                />
                                                <label className="billing-checkbox-label" htmlFor="billingSameAsShipping">
                                                    Billing address same as shipping
                                                </label>
                                            </div>

                                            <p className="payment-terms">
                                                Your payment info is encrypted and securely processed. SportStores never stores your full card details.
                                            </p>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'ViettelMoney' && (
                                        <div className="payment-details-card">
                                            <div className="viettel-details">
                                                <div className="form-group">
                                                    <label htmlFor="gpayName">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        id="gpayName"
                                                        name="gpayName"
                                                        placeholder="Enter phone number"
                                                        value={formData.gpayName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="gpayEmail">Email</label>
                                                    <input
                                                        type="email"
                                                        id="gpayEmail"
                                                        name="gpayEmail"
                                                        placeholder="Enter email"
                                                        value={formData.gpayEmail}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'bank' && (
                                        <div className="payment-details-card">
                                            <div className="bank-details">
                                                <div className="form-group">
                                                    <label htmlFor="bank">Select Bank</label>
                                                    <select
                                                        id="bank"
                                                        name="bank"
                                                        value={formData.bank}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="MB bank">MB Bank</option>
                                                        <option value="Agribank">Agribank</option>
                                                        <option value="Techcombank">Techcombank</option>
                                                        <option value="Vietcombank">Vietcombank</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="accountNumber">Account Number</label>
                                                    <input
                                                        type="text"
                                                        id="accountNumber"
                                                        name="accountNumber"
                                                        placeholder="Enter account number"
                                                        value={formData.accountNumber}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    {errors.accountNumber && (
                                                        <span className="field-error">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                            </svg>
                                                            {errors.accountNumber}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="accountName">Account Holder Name</label>
                                                    <input
                                                        type="text"
                                                        id="accountName"
                                                        name="accountName"
                                                        placeholder="Enter account holder name"
                                                        value={formData.accountName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="transferContent">Transfer Content (optional)</label>
                                                    <input
                                                        type="text"
                                                        id="transferContent"
                                                        name="transferContent"
                                                        placeholder="e.g. Order #123"
                                                        value={formData.transferContent}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button type="submit" className="checkout-submit-btn">
                                    Place Order
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>

                                <div className="secure-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    256-bit SSL Encrypted & Secure Checkout
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="checkout-summary-col">
                        <div className="order-summary-card">
                            <div className="order-summary-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                Order Summary
                            </div>

                            <div className="order-items-list">
                                {Object.keys(cartItems).map(itemId => {
                                    const product = all_product.find(p => p.id === Number(itemId));
                                    if (!product) return null;
                                    return Object.keys(cartItems[itemId]).map(size => (
                                        <div key={`${itemId}-${size}`} className="order-item">
                                            <div className="order-item-image">
                                                <img src={product.image} alt={product.name} />
                                                <span className="order-item-qty-badge">{cartItems[itemId][size]}</span>
                                            </div>
                                            <div className="order-item-info">
                                                <span className="order-item-name">{product.name}</span>
                                                <span className="order-item-size">Size: {size}</span>
                                            </div>
                                            <span className="order-item-price">
                                                ${(product.new_price * cartItems[itemId][size]).toFixed(2)}
                                            </span>
                                        </div>
                                    ));
                                })}
                            </div>

                            <div className="order-summary-divider" />

                            <div className="order-summary-rows">
                                <div className="summary-row">
                                    <span className="summary-row-label">Subtotal</span>
                                    <span className="summary-row-value">${total.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">Shipping</span>
                                    <span className="summary-row-value free">Free</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">Tax</span>
                                    <span className="summary-row-value">$0.00</span>
                                </div>
                            </div>

                            <div className="summary-total-divider" />

                            <div className="summary-total-row">
                                <span className="summary-total-label">Total</span>
                                <span className="summary-total-amount">${total.toFixed(2)}</span>
                            </div>

                            <div className="delivery-promise">
                                <div className="promise-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                    Free delivery in 3–7 business days
                                </div>
                                <div className="promise-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <polyline points="1 20 1 14 7 14"></polyline>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                    </svg>
                                    Easy 14-day return policy
                                </div>
                                <div className="promise-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    100% secure payment guaranteed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
