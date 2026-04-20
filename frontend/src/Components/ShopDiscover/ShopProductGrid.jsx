import React, { useState, useEffect, useRef } from 'react';
import './ShopProductGrid.css';
import Item from '../Item/Item';
import { LayoutGrid, LayoutList, LayoutGridIcon } from 'lucide-react';

const ShopProductGrid = ({ products, productFeedbacks, sortOrder, filters }) => {
    const [visible, setVisible] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'masonry'
    const gridRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
    }, []);

    // Apply filters and sorting
    let filteredProducts = [...(products || [])];

    // Apply sort
    if (sortOrder === 'price-asc') {
        filteredProducts.sort((a, b) => (a.new_price || 0) - (b.new_price || 0));
    } else if (sortOrder === 'price-desc') {
        filteredProducts.sort((a, b) => (b.new_price || 0) - (a.new_price || 0));
    } else if (sortOrder === 'rating') {
        filteredProducts.sort((a, b) => {
            const aFeedbacks = productFeedbacks?.[a.id] || [];
            const bFeedbacks = productFeedbacks?.[b.id] || [];
            const aRating = aFeedbacks.length
                ? aFeedbacks.reduce((sum, f) => sum + f.rating, 0) / aFeedbacks.length
                : 0;
            const bRating = bFeedbacks.length
                ? bFeedbacks.reduce((sum, f) => sum + f.rating, 0) / bFeedbacks.length
                : 0;
            return bRating - aRating;
        });
    } else if (sortOrder === 'newest') {
        filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortOrder === 'name-asc') {
        filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Apply simple filters
    if (filters && Object.keys(filters).length > 0) {
        filteredProducts = filteredProducts.filter((product) => {
            // Price filter
            if (filters.price?.length) {
                const price = product.new_price || 0;
                const matches = filters.price.some((f) => {
                    if (f === 'Under $25') return price < 25;
                    if (f === '$25 - $50') return price >= 25 && price <= 50;
                    if (f === '$50 - $100') return price > 50 && price <= 100;
                    if (f === '$100 - $200') return price > 100 && price <= 200;
                    if (f === 'Over $200') return price > 200;
                    return true;
                });
                if (!matches) return false;
            }
            // Rating filter
            if (filters.rating?.length) {
                const aFeedbacks = productFeedbacks?.[product.id] || [];
                const avg = aFeedbacks.length
                    ? aFeedbacks.reduce((sum, f) => sum + f.rating, 0) / aFeedbacks.length
                    : 0;
                const matches = filters.rating.some((f) => {
                    if (f === '5 Stars') return avg >= 5;
                    if (f === '4+ Stars') return avg >= 4;
                    if (f === '3+ Stars') return avg >= 3;
                    return true;
                });
                if (!matches) return false;
            }
            return true;
        });
    }

    if (!filteredProducts.length) {
        return (
            <div className="shop-grid-empty">
                <div className="empty-icon">
                    <LayoutGrid size={48} />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div id="shop-products-grid" className={`shop-grid-wrapper ${visible ? 'grid-visible' : ''}`}>
            <div className="shop-grid-header">
                <span className="shop-grid-count">
                    Showing <strong>{filteredProducts.length}</strong> products
                </span>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                        onClick={() => setViewMode('masonry')}
                        title="Masonry view"
                    >
                        <LayoutGridIcon size={16} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        <LayoutList size={16} />
                    </button>
                </div>
            </div>

            <div
                ref={gridRef}
                className={`shop-grid ${
                    viewMode === 'list' ? 'grid-list-mode' :
                    viewMode === 'masonry' ? 'grid-masonry-mode' : 'grid-grid-mode'
                }`}
            >
                {filteredProducts.map((product, idx) => (
                    <div
                        key={product.id || idx}
                        className={`shop-grid-item ${viewMode === 'masonry' ? 'masonry-item' : ''}`}
                        style={{ animationDelay: `${idx * 40}ms` }}
                    >
                        <Item
                            id={product.id}
                            name={product.name}
                            image={product.image}
                            new_price={product.new_price}
                            old_price={product.old_price}
                            feedbacks={productFeedbacks?.[product.id] || []}
                            category={product.category}
                            generalCategory={product.generalCategory}
                            detailedCategory={product.detailedCategory}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopProductGrid;
