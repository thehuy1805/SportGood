import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateProduct.css';
import API_BASE_URL from '../../config';

// 独立的 Update Modal 组件（用于 ListProduct 页面内联调用）
export const UpdateProductModal = ({ product, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: product.name || '',
    old_price: product.old_price || '',
    new_price: product.new_price || '',
    description: product.description || '',
    generalCategory: product.generalCategory || 'Men',
    detailedCategory: product.detailedCategory || 'Club Jerseys',
  });
  const [image, setImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const detailedCategories = {
    Men: ['Club Jerseys', 'National Team Jerseys', 'Basketball Clothing', 'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes'],
    Women: ['Club Jerseys', 'National Team Jerseys', 'Basketball Clothing', 'Swimwear', 'Gym Sets', 'Soccer Shoes', 'Basketball Shoes'],
    'Sports Equipment': ['Soccer Accessories', 'Basketball Accessories', 'Swimming Accessories'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // 当 generalCategory 改变时，重置 detailedCategory
      if (name === 'generalCategory') {
        next.detailedCategory = detailedCategories[value][0];
      }
      return next;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.new_price || parseFloat(form.new_price) <= 0) newErrors.new_price = 'Price must be greater than 0';
    if (form.old_price && parseFloat(form.old_price) > 0 && parseFloat(form.new_price) > parseFloat(form.old_price)) {
      newErrors.new_price = 'Sale price cannot be higher than original price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('old_price', form.old_price);
      formData.append('new_price', form.new_price);
      formData.append('description', form.description);
      formData.append('generalCategory', form.generalCategory);
      formData.append('detailedCategory', form.detailedCategory);
      if (image) formData.append('image', image);
      additionalImages.forEach(img => formData.append('additionalImages', img));

      const response = await fetch(`${API_BASE_URL}/updateproduct/${product.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        onUpdated();
        onClose();
      } else {
        alert(data.error || 'Update failed!');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="upm-dialog">
        {/* Header */}
        <div className="upm-header">
          <h2 className="upm-title">Update Product</h2>
          <button className="upm-close" onClick={onClose} title="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="upm-body">
          {/* Product Image */}
          <div className="upm-image-section">
            <div className="upm-image-preview">
              <img src={image ? URL.createObjectURL(image) : product.image} alt={form.name} />
            </div>
            <div className="upm-image-hint">
              <p>Current product image. Click the button below to change it.</p>
              <label className="upm-file-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                </svg>
                Upload New Image
                <input onChange={e => setImage(e.target.files[0])} type="file" accept="image/*" />
              </label>
            </div>
          </div>

          {/* Form fields */}
          <div className="upm-field">
            <label className="upm-label">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="upm-input" placeholder="Enter product name" />
            {errors.name && <span className="upm-error">{errors.name}</span>}
          </div>

          <div className="upm-row">
            <div className="upm-field">
              <label className="upm-label">Price ($)</label>
              <input name="old_price" value={form.old_price} onChange={handleChange} type="number" className="upm-input" placeholder="0.00" />
            </div>
            <div className="upm-field">
              <label className="upm-label">Offer Price ($)</label>
              <input name="new_price" value={form.new_price} onChange={handleChange} type="number" className="upm-input" placeholder="0.00" />
              {errors.new_price && <span className="upm-error">{errors.new_price}</span>}
            </div>
          </div>

          <div className="upm-row">
            <div className="upm-field">
              <label className="upm-label">General Category</label>
              <select name="generalCategory" value={form.generalCategory} onChange={handleChange} className="upm-select">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Sports Equipment">Sports Equipment</option>
              </select>
            </div>
            <div className="upm-field">
              <label className="upm-label">Detailed Category</label>
              <select name="detailedCategory" value={form.detailedCategory} onChange={handleChange} className="upm-select">
                {detailedCategories[form.generalCategory]?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="upm-field full-width">
            <label className="upm-label">Product Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="upm-textarea" rows={3} placeholder="Enter detailed product description..." />
          </div>
        </div>

        {/* Footer */}
        <div className="upm-footer">
          <button className="upm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="upm-btn-save" onClick={handleSubmit} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// =====================================================
// UpdateProduct Page (standalone page - size editing removed)
// =====================================================
// =====================================================
const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState({
    name: '', image: '', additionalImages: [],
    detailedCategory: '', generalCategory: '',
    new_price: '', old_price: '', description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allproducts`);
        const data = await response.json();
        const product = data.find((item) => item.id === parseInt(id));
        if (product) {
          setProductDetails(product);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchProduct();
  }, [id]);

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
    if (productDetails.name.trim() === '') newErrors.name = 'Product name is required';
    const price = parseFloat(productDetails.old_price);
    if (isNaN(price) || price <= 0) newErrors.old_price = 'Price must be greater than 0';
    const offerPrice = parseFloat(productDetails.new_price);
    if (isNaN(offerPrice) || offerPrice <= 0) newErrors.new_price = 'Offer price must be greater than 0';
    if (offerPrice > price) newErrors.new_price = 'Offer price cannot be higher than original price';
    if (productDetails.description.trim() === '') newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        alert('Product updated successfully!');
        navigate('/admin/list-product');
      } else {
        alert('Update failed!');
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
          <label className="admin-label">Product Name</label>
          <input name="name" value={productDetails.name} onChange={changeHandler} type="text" className="admin-input" placeholder="Product name" />
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
            Update
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

