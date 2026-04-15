import React, { useState, useEffect } from 'react';
import './ListProduct.css';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { UpdateProductModal } from '../UpdateProduct/UpdateProduct';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [updatingProduct, setUpdatingProduct] = useState(null); // Sản phẩm đang được chỉnh sửa trong modal

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allproducts`);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/removeproduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });
      const data = await response.json();
      if (data.success) {
        const updated = products.filter(p => p.id !== productId);
        setProducts(updated);
        setFilteredProducts(updated);
        toast.success('Product deleted successfully!');
      } else {
        toast.error('Failed to delete product.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred.');
    }
  };

  const highlightText = (text) => {
    if (typeof text !== 'string') text = String(text);
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ backgroundColor: 'rgba(249,115,22,0.25)', color: '#f97316', padding: '1px 3px', borderRadius: 3 }}>{part}</span>
        : part
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(value.toLowerCase()) ||
      p.description?.toLowerCase().includes(value.toLowerCase()) ||
      p.generalCategory?.toLowerCase().includes(value.toLowerCase()) ||
      p.detailedCategory?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (currentPage > 1) {
      pages.push(
        <button key="prev" className="page-btn nav" onClick={() => setCurrentPage(p => p - 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      );
    }

    if (start > 1) {
      pages.push(<button key={1} className="page-btn" onClick={() => setCurrentPage(1)}>1</button>);
      if (start > 2) pages.push(<span key="s1" className="page-ellipsis">…</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={`page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="e1" className="page-ellipsis">…</span>);
      pages.push(<button key={totalPages} className="page-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>);
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" className="page-btn nav" onClick={() => setCurrentPage(p => p + 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      );
    }

    return pages;
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="product-list-header">
        <div className="product-list-title">
          <div className="product-list-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </div>
          <h1>Product List</h1>
          {filteredProducts.length > 0 && (
            <span className="product-count-badge">{filteredProducts.length} products</span>
          )}
        </div>
        <div className="product-list-controls">
          <div className="product-search-wrapper">
            <span className="product-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="product-search-input"
            />
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <>
          <div className="product-grid">
            {currentProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-card-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-card-body">
                  <div className="product-card-category">
                    <span className="product-cat-chip general">{product.generalCategory}</span>
                    <span className="product-cat-chip detailed">{product.detailedCategory}</span>
                  </div>
                  <p className="product-card-name">{highlightText(product.name)}</p>
                  <p className="product-card-desc">{highlightText(product.description)}</p>
                  <div className="product-card-prices">
                    {product.old_price && Number(product.old_price) > 0 && (
                      <span className="product-price-old">${Number(product.old_price).toFixed(2)}</span>
                    )}
                    <span className="product-price-new">${Number(product.new_price).toFixed(2)}</span>
                  </div>
                </div>
                <div className="product-card-footer">
                  <button className="product-update-btn" onClick={() => setUpdatingProduct(product)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Update
                  </button>
                  <button className="product-delete-btn" onClick={() => handleDelete(product.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="product-pagination">
              {renderPages()}
            </div>
          )}
        </>
      ) : (
        <div className="product-empty">
          <div className="product-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <p className="product-empty-title">No Products Found</p>
          <p className="product-empty-desc">
            {searchTerm ? `No products match "${searchTerm}". Try adjusting your search.` : 'No products available. Add your first product to get started.'}
          </p>
        </div>
      )}

      {/* Update Product Modal */}
      {updatingProduct && (
        <UpdateProductModal
          product={updatingProduct}
          onClose={() => setUpdatingProduct(null)}
          onUpdated={() => {
            // Làm mới danh sách sản phẩm sau khi cập nhật
            const fetchProducts = async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/allproducts`);
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
              } catch (error) {
                console.error('Error refreshing products:', error);
              }
            };
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default ListProduct;
