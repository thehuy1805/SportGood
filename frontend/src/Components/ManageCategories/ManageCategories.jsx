import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageCategories.css';

const ManageCategories = () => {
    const [generalCategory, setGeneralCategory] = useState('');
    const [type, setType] = useState('');
    const [sizes, setSizes] = useState([]);
    const [detailedCategoryName, setDetailedCategoryName] = useState('');
    const [categories, setCategories] = useState([]);

    const defaultDetailedCategories = [
        { _id: 'default-Men-Club Jerseys', name: 'Club Jerseys', generalCategory: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Men-National Team Jerseys', name: 'National Team Jerseys', generalCategory: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Men-Basketball Clothing', name: 'Basketball Clothing', generalCategory: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Men-Swimwear', name: 'Swimwear', generalCategory: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Men-Gym Sets', name: 'Gym Sets', generalCategory: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Men-Soccer Shoes', name: 'Soccer Shoes', generalCategory: 'Men', sizes: ['38', '39', '40', '41', '42', '43'] },
        { _id: 'default-Men-Basketball Shoes', name: 'Basketball Shoes', generalCategory: 'Men', sizes: ['38', '39', '40', '41', '42', '43'] },
        { _id: 'default-Women-Club Jerseys', name: 'Club Jerseys', generalCategory: 'Women', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Women-National Team Jerseys', name: 'National Team Jerseys', generalCategory: 'Women', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Women-Basketball Clothing', name: 'Basketball Clothing', generalCategory: 'Women', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Women-Swimwear', name: 'Swimwear', generalCategory: 'Women', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Women-Gym Sets', name: 'Gym Sets', generalCategory: 'Women', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { _id: 'default-Women-Soccer Shoes', name: 'Soccer Shoes', generalCategory: 'Women', sizes: ['38', '39', '40', '41', '42', '43'] },
        { _id: 'default-Women-Basketball Shoes', name: 'Basketball Shoes', generalCategory: 'Women', sizes: ['38', '39', '40', '41', '42', '43'] },
        { _id: 'default-Sports Equipment-Soccer Accessories', name: 'Soccer Accessories', generalCategory: 'Sports Equipment', sizes: [] },
        { _id: 'default-Sports Equipment-Basketball Accessories', name: 'Basketball Accessories', generalCategory: 'Sports Equipment', sizes: [] },
        { _id: 'default-Sports Equipment-Swimming Accessories', name: 'Swimming Accessories', generalCategory: 'Sports Equipment', sizes: [] },
    ];

    useEffect(() => {
        fetchDetailedCategories();
    }, []);

    const fetchDetailedCategories = async () => {
        try {
            const response = await fetch('http://localhost:4000/getDetailedCategories');
            const data = await response.json();
            if (data.success) setCategories(data.categories);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setType(selectedType);
        if (selectedType === 'Clothes') setSizes(['S', 'M', 'L', 'XL', 'XXL']);
        else if (selectedType === 'Shoes') setSizes(['38', '39', '40', '41', '42', '43']);
        else setSizes([]);
    };

    const handleAddCategory = async () => {
        if (!generalCategory || !detailedCategoryName) {
            alert('Please select a general category and provide a name.');
            return;
        }
        let finalSizes = [];
        if (generalCategory === 'Men' || generalCategory === 'Women') {
            if (type === 'Clothes') finalSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            else if (type === 'Shoes') finalSizes = ['38', '39', '40', '41', '42', '43'];
        }
        try {
            const response = await axios.post('http://localhost:4000/addDetailedCategory', {
                name: detailedCategoryName,
                generalCategory,
                type,
                sizes: finalSizes,
            });
            if (response.data.success) {
                alert('Category added successfully!');
                fetchDetailedCategories();
                setGeneralCategory('');
                setType('');
                setDetailedCategoryName('');
                setSizes([]);
            } else {
                alert(response.data.error || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category? This cannot be undone.')) return;
        try {
            const check = await axios.get(`http://localhost:4000/checkProductsInCategory/${id}`);
            if (check.data.hasProducts) {
                alert(`Cannot delete. ${check.data.productCount} products exist in this category.`);
                return;
            }
            const response = await axios.delete(`http://localhost:4000/deleteDetailedCategory/${id}`);
            if (response.data.success) {
                alert('Category deleted!');
                fetchDetailedCategories();
            } else {
                alert(response.data.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const allCategories = [...defaultDetailedCategories, ...categories];

    const getCategoryColor = (generalCat) => {
        const colors = { Men: '#60a5fa', Women: '#f472b6', 'Sports Equipment': '#4ade80' };
        return colors[generalCat] || '#94a3b8';
    };

    return (
        <div style={{ padding: '32px' }}>
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <div className="admin-page-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"></path>
                        </svg>
                    </div>
                    <h1>Category Management</h1>
                </div>
            </div>

            <div className="categories-layout">
                {/* Form column */}
                <div className="categories-form-col">
                    <div className="categories-form-card">
                        <h3 className="categories-form-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add New Category
                        </h3>

                        <div className="admin-input-group">
                            <label className="admin-label">General Category</label>
                            <select value={generalCategory} onChange={(e) => { setGeneralCategory(e.target.value); setType(''); setSizes([]); }} className="admin-select">
                                <option value="">Select Category</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Sports Equipment">Sports Equipment</option>
                            </select>
                        </div>

                        {(generalCategory === 'Men' || generalCategory === 'Women') && (
                            <div className="admin-input-group">
                                <label className="admin-label">Type</label>
                                <select value={type} onChange={handleTypeChange} className="admin-select">
                                    <option value="">Select Type</option>
                                    <option value="Clothes">Clothes</option>
                                    <option value="Shoes">Shoes</option>
                                </select>
                            </div>
                        )}

                        <div className="admin-input-group">
                            <label className="admin-label">Category Name</label>
                            <input
                                type="text"
                                value={detailedCategoryName}
                                onChange={(e) => setDetailedCategoryName(e.target.value)}
                                className="admin-input"
                                placeholder="Enter category name"
                            />
                        </div>

                        {sizes.length > 0 && (
                            <div className="size-tags">
                                {sizes.map((size, i) => (
                                    <span key={i} className="size-tag">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        </svg>
                                        {size}
                                    </span>
                                ))}
                            </div>
                        )}

                        {generalCategory === 'Sports Equipment' && (
                            <div className="categories-note">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Sports Equipment categories have no sizes.
                            </div>
                        )}

                        <button className="categories-add-btn" onClick={handleAddCategory}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Category
                        </button>
                    </div>
                </div>

                {/* List column */}
                <div className="categories-list-col">
                    <div className="categories-list-card">
                        <div className="categories-list-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            <h3>All Categories ({allCategories.length})</h3>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table categories-table">
                                <thead>
                                    <tr>
                                        <th>General</th>
                                        <th>Category Name</th>
                                        <th>Sizes</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allCategories.map(cat => (
                                        <tr key={cat._id}>
                                            <td>
                                                <span
                                                    className="cat-general"
                                                    style={{ color: getCategoryColor(cat.generalCategory) }}
                                                >
                                                    {cat.generalCategory}
                                                </span>
                                            </td>
                                            <td style={{ color: '#e2e8f0', fontWeight: 600 }}>{cat.name}</td>
                                            <td>
                                                <div className="cat-sizes">
                                                    {cat.sizes?.length > 0 ? cat.sizes.map((s, i) => (
                                                        <span key={i} className="cat-size-chip">{s}</span>
                                                    )) : (
                                                        <span className="cat-size-chip none">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button className="cat-delete-btn" onClick={() => handleDeleteCategory(cat._id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCategories;
