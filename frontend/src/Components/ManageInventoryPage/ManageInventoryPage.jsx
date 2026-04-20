import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import './ManageInventoryPage.css';
import { ShopContext } from '../../Context/ShopContext';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const SHOE_CATEGORIES = ['Soccer Shoes', 'Basketball Shoes'];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'low_stock', label: 'Few left' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const ManageInventoryPage = () => {
  const { all_product } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  useEffect(() => {
    setProducts(all_product);
  }, [all_product]);

  // ── fetchProducts phải được khai báo TRƯỚC useEffect gọi nó ──
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allproducts`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  useEffect(() => {
    const filtered = products.filter(p =>
      (filterCategory === 'All' || p.detailedCategory === filterCategory) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm))
    );
    const total = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
    if (currentPage > total && total > 0) setCurrentPage(total);
  }, [products, filterCategory, searchTerm, currentPage]);

  const updateStock = async (id, newStock, newSizeStatus) => {
    if (newStock !== undefined && (isNaN(Number(newStock)) || Number(newStock) < 0)) {
      toast.warn('Please enter a valid quantity (0 or greater)');
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/updatestock/${id}`, {
        stock: newStock,
        sizeStatus: newSizeStatus,
      });
      toast.success('Inventory updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Unable to update inventory');
    }
  };

  const categories = ['All', ...new Set(products.map(product => product.detailedCategory))];

  const filteredProducts = products.filter(product =>
    (filterCategory === 'All' || product.detailedCategory === filterCategory) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.id.toString().includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <div className="admin-page-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <h1>Inventory Management</h1>
        </div>
      </div>

      <div className="inventory-header">
        <div className="inventory-controls">
          <div className="searchInventory-container">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="inventory-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="inventory-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span className="admin-loading-text">Loading inventory...</span>
        </div>
      ) : (
        <>
          <div className="inventory-grid-wrapper">
            {paginatedProducts.map(product => {
              const isShoe = SHOE_CATEGORIES.includes(product.detailedCategory);
              const isClothes = product.generalCategory === 'Men' || product.generalCategory === 'Women';
              const sizes = isShoe ? ['39', '40', '41', '42', '43'] : isClothes ? ['S', 'M', 'L', 'XL', 'XXL'] : [];

              return (
                <InventoryCard
                  key={product.id}
                  product={product}
                  sizes={sizes}
                  isSportsEquipment={product.generalCategory === 'Sports Equipment'}
                  updateStock={updateStock}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="inventory-pagination">
              <button
                className="inv-page-btn inv-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="inv-page-ellipsis">…</span>
                ) : (
                  <button
                    key={page}
                    className={`inv-page-btn ${currentPage === page ? 'inv-page-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="inv-page-btn inv-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="inv-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p>No products found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const InventoryCard = ({ product, sizes, isSportsEquipment, updateStock }) => {
  const [localStock, setLocalStock] = useState(product.stock || 0);
  const [localSizeStatus, setLocalSizeStatus] = useState(() => {
    const init = {};
    sizes.forEach(s => {
      const existing = product.sizeStatus?.[s];
      init[s] = existing ? { ...existing } : { status: 'available', remainingQuantity: null };
    });
    return init;
  });
  const [localSeStatus, setLocalSeStatus] = useState(() => {
    const existing = product.sizeStatus?.['__se__'];
    return existing ? { ...existing } : { status: 'available', remainingQuantity: null };
  });

  // Use a ref to track which product.id we've already initialized for
  // This prevents the useEffect from resetting local state on every parent re-render
  // (objects in deps create new references on every render, triggering the effect)
  const initializedRef = useRef(null);

  useEffect(() => {
    // Only reset when we see a NEW product.id (switching between different products)
    if (initializedRef.current !== product.id) {
      const initSe = {};
      sizes.forEach(s => {
        const existing = product.sizeStatus?.[s];
        initSe[s] = existing ? { ...existing } : { status: 'available', remainingQuantity: null };
      });
      setLocalSizeStatus(initSe);
      const existingSe = product.sizeStatus?.['__se__'];
      setLocalSeStatus(existingSe ? { ...existingSe } : { status: 'available', remainingQuantity: null });
      setLocalStock(product.stock || 0);
      initializedRef.current = product.id;
    }
  }, [product.id, sizes]);

  const handleSizeStatusChange = (size, status) => {
    setLocalSizeStatus(prev => ({
      ...prev,
      [size]: { ...prev[size], status }
    }));
  };

  const handleSizeQtyChange = (size, qty) => {
    const val = qty === '' ? null : parseInt(qty, 10);
    setLocalSizeStatus(prev => ({
      ...prev,
      [size]: { ...prev[size], remainingQuantity: val }
    }));
  };

  const handleSeStatusChange = (status) => {
    setLocalSeStatus(prev => ({ ...prev, status }));
  };

  const handleSeQtyChange = (qty) => {
    const val = qty === '' ? null : parseInt(qty, 10);
    setLocalSeStatus(prev => ({ ...prev, remainingQuantity: val }));
  };

  const buildSizeStatus = () => {
    const result = {};
    sizes.forEach(s => { result[s] = localSizeStatus[s]; });
    result['__se__'] = localSeStatus;
    return result;
  };

  const handleUpdate = () => {
    // Validate: few_left must have remainingQuantity > 0
    const hasLowStockWithoutQty = Object.values(localSizeStatus).some(
      entry => entry.status === 'low_stock' && (entry.remainingQuantity == null || entry.remainingQuantity <= 0)
    );
    if (isSportsEquipment && localSeStatus.status === 'low_stock' &&
        (localSeStatus.remainingQuantity == null || localSeStatus.remainingQuantity <= 0)) {
      toast.warn('Please enter a valid quantity for "Few left" status.');
      return;
    }
    if (hasLowStockWithoutQty) {
      toast.warn('Please enter a valid quantity for each size with "Few left" status.');
      return;
    }

    if (isSportsEquipment) {
      updateStock(product.id, localStock, buildSizeStatus());
    } else {
      updateStock(product.id, undefined, buildSizeStatus());
    }
  };

  return (
    <div className="inventory-card">
      <div className="inventory-card-header">
        <span className="product-id">#{product.id}</span>
        <span className="product-category">{product.detailedCategory}</span>
      </div>
      <div className="inventory-card-body">
        <p className="product-name">{product.name}</p>

        {/* ── SIZE ROWS (Clothes / Shoes) ── */}
        {sizes.length > 0 && (
          <div className="sizes-inventory">
            {sizes.map(size => {
              const entry = localSizeStatus[size] || { status: 'available', remainingQuantity: null };
              return (
                <div key={size} className="size-stock-item">
                  <span className="size-label">{size}</span>
                  <div className="size-stock-control">
                    <select
                      className="mip-size-select"
                      value={entry.status}
                      onChange={(e) => handleSizeStatusChange(size, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {entry.status === 'low_stock' && (
                      <div className="mip-qty-wrap">
                        <span className="mip-qty-label">Qty:</span>
                        <input
                          type="number"
                          className="mip-qty-input"
                          value={entry.remainingQuantity ?? ''}
                          min={1}
                          placeholder="e.g. 3"
                          onChange={(e) => handleSizeQtyChange(size, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SPORTS EQUIPMENT ROW ── */}
        {isSportsEquipment && (
          <div className="size-stock-item">
            <span className="size-label">Total</span>
            <div className="size-stock-control">
              <select
                className="mip-size-select"
                value={localSeStatus.status}
                onChange={(e) => handleSeStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {localSeStatus.status === 'low_stock' && (
                <div className="mip-qty-wrap">
                  <span className="mip-qty-label">Qty:</span>
                  <input
                    type="number"
                    className="mip-qty-input"
                    value={localSeStatus.remainingQuantity ?? ''}
                    min={1}
                    placeholder="e.g. 5"
                    onChange={(e) => handleSeQtyChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <button className="inventory-update-btn" style={{ marginTop: 12 }} onClick={handleUpdate}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Update Inventory
        </button>
      </div>
    </div>
  );
};

export default ManageInventoryPage;
