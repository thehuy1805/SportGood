import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProduct.css';
import { useNavigate } from 'react-router-dom';

export const AddProduct = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name: '',
        image: '',
        detailedCategory: 'Club Jerseys',
        generalCategory: 'Men',
        new_price: '',
        old_price: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCustomCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4000/getDetailedCategories');
                if (response.data.success) {
                    setCustomCategories(response.data.categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCustomCategories();
    }, []);

    const imageHandler = (e) => {
        setImages([...e.target.files]);
    };

    const changeHandler = (e) => {
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
        setProductDetails({
            ...productDetails,
            [e.target.name]: e.target.value
        });
    };

    const detailedCategories = {
        Men: [
            'Club Jerseys', 'National Team Jerseys', 'Basketball Clothing',
            'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes',
            ...customCategories.filter(cat => cat.generalCategory === 'Men').map(cat => cat.name),
        ],
        Women: [
            'Club Jerseys', 'National Team Jerseys', 'Basketball Clothing',
            'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes',
            ...customCategories.filter(cat => cat.generalCategory === 'Women').map(cat => cat.name),
        ],
        'Sports Equipment': [
            'Soccer Accessories', 'Basketball Accessories', 'Swimming Accessories',
            ...customCategories.filter(cat => cat.generalCategory === 'Sports Equipment').map(cat => cat.name),
        ],
    };

    const validateForm = () => {
        const newErrors = {};
        if (productDetails.name.trim() === '') newErrors.name = 'Product title is required';
        const price = parseFloat(productDetails.old_price);
        if (isNaN(price) || price <= 0) newErrors.old_price = 'Price must be a positive number';
        const offerPrice = parseFloat(productDetails.new_price);
        if (isNaN(offerPrice) || offerPrice <= 0) newErrors.new_price = 'Offer price must be a positive number';
        if (offerPrice > price) newErrors.new_price = 'Offer price cannot be higher than price';
        if (productDetails.description.trim() === '') newErrors.description = 'Product description is required';
        if (images.length === 0) newErrors.images = 'Please upload at least one image';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const Add_Product = async () => {
        if (!validateForm()) return;
        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));
        Object.keys(productDetails).forEach(key => {
            formData.append(key, productDetails[key]);
        });
        try {
            const response = await axios.post('http://localhost:4000/addproduct', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                alert('Product added successfully!');
                setProductDetails({
                    name: '', image: '', detailedCategory: 'Club Jerseys',
                    generalCategory: 'Men', new_price: '', old_price: '', description: '',
                });
                setImages([]);
            } else {
                alert('Failed to add product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <div className="admin-page-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </div>
                    <h1>Add New Product</h1>
                </div>
                <button className="admin-btn-secondary" onClick={() => navigate('/admin/list-product')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to List
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-input-group">
                    <label className="admin-label">Product Title</label>
                    <input
                        name='name'
                        value={productDetails.name}
                        onChange={changeHandler}
                        type="text"
                        className="admin-input"
                        placeholder="Enter product title"
                    />
                    {errors.name && <span className="admin-error">{errors.name}</span>}
                </div>

                <div className="addproduct-price">
                    <div className="admin-input-group">
                        <label className="admin-label">Price ($)</label>
                        <input
                            name="old_price"
                            value={productDetails.old_price}
                            onChange={changeHandler}
                            type="number"
                            className="admin-input"
                            placeholder="0.00"
                        />
                        {errors.old_price && <span className="admin-error">{errors.old_price}</span>}
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Offer Price ($)</label>
                        <input
                            name="new_price"
                            value={productDetails.new_price}
                            onChange={changeHandler}
                            type="number"
                            className="admin-input"
                            placeholder="0.00"
                        />
                        {errors.new_price && <span className="admin-error">{errors.new_price}</span>}
                    </div>
                </div>

                <div className="admin-grid-2">
                    <div className="admin-input-group">
                        <label className="admin-label">General Category</label>
                        <select
                            name="generalCategory"
                            value={productDetails.generalCategory}
                            onChange={changeHandler}
                            className="admin-select"
                        >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Sports Equipment">Sports Equipment</option>
                        </select>
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Detailed Category</label>
                        <select
                            name="detailedCategory"
                            value={productDetails.detailedCategory}
                            onChange={changeHandler}
                            className="admin-select"
                        >
                            {detailedCategories[productDetails.generalCategory]?.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-input-group">
                    <label className="admin-label">Product Description</label>
                    <textarea
                        name='description'
                        value={productDetails.description}
                        onChange={changeHandler}
                        className="admin-textarea"
                        placeholder="Describe the product features, material, fit, etc."
                        rows={4}
                    />
                    {errors.description && <span className="admin-error">{errors.description}</span>}
                </div>

                <div className="admin-input-group">
                    <label className="admin-label">Product Images</label>
                    <label htmlFor="file-input">
                        {images.length > 0 ? (
                            <img
                                src={URL.createObjectURL(images[0])}
                                className="addproduct-thumnail-img"
                                alt="Preview"
                            />
                        ) : (
                            <div style={{
                                width: 140, height: 140, borderRadius: 12, border: '2px dashed #334155',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', gap: 8, cursor: 'pointer', color: '#64748b',
                                background: '#0f172a'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span style={{ fontSize: 11, fontWeight: 600 }}>Click to upload</span>
                            </div>
                        )}
                    </label>
                    <input onChange={imageHandler} type="file" name='images' id='file-input' multiple hidden />
                    {images.length > 1 && (
                        <div className="image-preview-row" style={{ marginTop: 8 }}>
                            {Array.from(images).slice(1).map((img, i) => (
                                <img key={i} src={URL.createObjectURL(img)} className="image-preview-item" alt="" />
                            ))}
                        </div>
                    )}
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{images.length} image(s) selected</span>
                    {errors.images && <span className="admin-error">{errors.images}</span>}
                </div>

                <button onClick={Add_Product} className="admin-btn-primary" style={{ marginTop: 8 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Product
                </button>
            </div>
        </div>
    );
};

export default AddProduct;
