import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateProduct.css';
import API_BASE_URL from '../../config';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'low_stock', label: 'Few left' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState({
    name: '', image: '', additionalImages: [],
    detailedCategory: '', generalCategory: '',
    new_price: '', old_price: '', description: '',
    size: [],
  });
  const [sizeStatus, setSizeStatus] = useState({});
  const [seStatus, setSeStatus] = useState({ status: 'available', remainingQuantity: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allproducts`);
        const data = await response.json();
        const product = data.find((item) => item.id === parseInt(id));
        if (product) {
          setProductDetails(product);
          const statusMap = product.sizeStatus || {};
          const normalized = typeof statusMap === 'object' && !(statusMap instanceof Map)
            ? statusMap
            : Object.fromEntries(statusMap || new Map());
          setSizeStatus(normalized);
          if (normalized['__se__']) {
            setSeStatus(normalized['__se__']);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const sizes = productDetails.size || [];

  const handleSizeStatusChange = (size, status) => {
    setSizeStatus(prev => ({
      ...prev,
      [size]: { ...prev[size], status, remainingQuantity: status === 'low_stock' ? prev[size]?.remainingQuantity : null }
    }));
  };

  const handleSizeQtyChange = (size, qty) => {
    const val = qty === '' ? null : parseInt(qty, 10);
    setSizeStatus(prev => ({
      ...prev,
      [size]: { ...prev[size], remainingQuantity: val }
    }));
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const imageHandler = (e) => {
    setProductDetails({ ...productDetails, image: e.target.files[0] });
  };

  const additionalImagesHandler = (e) => {
    setProductDetails({ ...productDetails, additionalImages: [...e.target.files] });
  };

  const detailedCategories = {
    Men: ['Club Jerseys', 'National Team Jerseys', 'Basketball Clothing', 'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes'],
    Women: ['Club Jerseys', 'National Team Jerseys', 'Basketball Clothing', 'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes'],
    'Sports Equipment': ['Soccer Accessories', 'Basketball Accessories', 'Swimming Accessories'],
  };

  const validateForm = () => {
    const newErrors = {};
    if (productDetails.name.trim() === '') newErrors.name = 'Product title is required';
    const price = parseFloat(productDetails.old_price);
    if (isNaN(price) || price <= 0) newErrors.old_price = 'Price must be positive';
    const offerPrice = parseFloat(productDetails.new_price);
    if (isNaN(offerPrice) || offerPrice <= 0) newErrors.new_price = 'Offer price must be positive';
    if (offerPrice > price) newErrors.new_price = 'Offer price cannot be higher than price';
    if (productDetails.description.trim() === '') newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSizeStatus = () => {
    const result = { ...sizeStatus };
    result['__se__'] = seStatus;
    return result;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    const formData = new FormData();
    if (productDetails.image instanceof File) formData.append('image', productDetails.image);
    productDetails.additionalImages.forEach((img) => { if (img instanceof File) formData.append('additionalImages', img); });
    Object.keys(productDetails).forEach((key) => {
      if (key !== 'image' && key !== 'additionalImages') formData.append(key, productDetails[key]);
    });
    try {
      const response = await fetch(`${API_BASE_URL}/updateproduct/${id}`, {
        method: 'PUT', body: formData,
      });
      const data = await response.json();
      if (data.success) {
        await fetch(`${API_BASE_URL}/updatestock/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sizeStatus: buildSizeStatus() }),
        });
        alert('Product updated successfully!');
        navigate('/admin/list-product');
      } else {
        alert('Failed to update product!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <div className="admin-page-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h1>Update Product</h1>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-input-group">
          <label className="admin-label">Product Title</label>
          <input name="name" value={productDetails.name} onChange={changeHandler} type="text" className="admin-input" placeholder="Product title" />
          {errors.name && <span className="admin-error">{errors.name}</span>}
        </div>

        <div className="update-product-price">
          <div className="admin-input-group">
            <label className="admin-label">Price ($)</label>
            <input name="old_price" value={productDetails.old_price} onChange={changeHandler} type="number" className="admin-input" placeholder="0.00" />
            {errors.old_price && <span className="admin-error">{errors.old_price}</span>}
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Offer Price ($)</label>
            <input name="new_price" value={productDetails.new_price} onChange={changeHandler} type="number" className="admin-input" placeholder="0.00" />
            {errors.new_price && <span className="admin-error">{errors.new_price}</span>}
          </div>
        </div>

        <div className="admin-grid-2">
          <div className="admin-input-group">
            <label className="admin-label">General Category</label>
            <select name="generalCategory" value={productDetails.generalCategory} onChange={changeHandler} className="admin-select">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Sports Equipment">Sports Equipment</option>
            </select>
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Detailed Category</label>
            <select name="detailedCategory" value={productDetails.detailedCategory} onChange={changeHandler} className="admin-select">
              {detailedCategories[productDetails.generalCategory]?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-input-group">
          <label className="admin-label">Product Description</label>
          <textarea name="description" value={productDetails.description} onChange={changeHandler} className="admin-textarea" placeholder="Product description" rows={4} />
          {errors.description && <span className="admin-error">{errors.description}</span>}
        </div>

        {/* ── Size Status Management (Clothes / Shoes) ── */}
        {sizes.length > 0 && (
          <div className="admin-input-group">
            <label className="admin-label">Size Status</label>
            <div className="up-size-grid">
              {sizes.map(size => {
                const entry = sizeStatus[size] || { status: 'available', remainingQuantity: null };
                return (
                  <div key={size} className="up-size-row">
                    <span className="up-size-name">{size}</span>
                    <select
                      className="up-size-select"
                      value={entry.status}
                      onChange={(e) => handleSizeStatusChange(size, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {entry.status === 'low_stock' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Qty:</span>
                        <input
                          type="number"
                          style={{
                            width: 80, padding: '6px 10px', fontSize: 13, color: '#e2e8f0',
                            border: '1.5px solid #334155', borderRadius: 8,
                            background: '#0f172a', fontFamily: 'inherit', fontWeight: 600,
                            outline: 'none',
                          }}
                          value={entry.remainingQuantity ?? ''}
                          min={1}
                          placeholder="e.g. 3"
                          onChange={(e) => handleSizeQtyChange(size, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sports Equipment Status ── */}
        {productDetails.generalCategory === 'Sports Equipment' && (
          <div className="admin-input-group">
            <label className="admin-label">Stock Status</label>
            <div className="up-size-grid">
              <div className="up-size-row">
                <span className="up-size-name" style={{ width: 60 }}>Total</span>
                <select
                  className="up-size-select"
                  value={seStatus.status}
                  onChange={(e) => setSeStatus(prev => ({ ...prev, status: e.target.value, remainingQuantity: e.target.value === 'low_stock' ? prev.remainingQuantity : null }))}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {seStatus.status === 'low_stock' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Qty:</span>
                    <input
                      type="number"
                      style={{
                        width: 80, padding: '6px 10px', fontSize: 13, color: '#e2e8f0',
                        border: '1.5px solid #334155', borderRadius: 8,
                        background: '#0f172a', fontFamily: 'inherit', fontWeight: 600,
                        outline: 'none',
                      }}
                      value={seStatus.remainingQuantity ?? ''}
                      min={1}
                      placeholder="e.g. 5"
                      onChange={(e) => setSeStatus(prev => ({ ...prev, remainingQuantity: e.target.value === '' ? null : parseInt(e.target.value, 10) }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="image-container">
          <div className="admin-input-group">
            <label className="admin-label">Main Image</label>
            <label>
              <img
                src={productDetails.image instanceof File ? URL.createObjectURL(productDetails.image) : productDetails.image || ''}
                className="update-product-thumbnail-img"
                alt="Product"
              />
            </label>
            <input onChange={imageHandler} type="file" name="image" hidden />
          </div>
        </div>

        <div className="update-product-buttons">
          <button onClick={handleUpdate} className="update-product-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Update Product
          </button>
          <button onClick={() => navigate('/admin/list-product')} className="cancel-product-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
