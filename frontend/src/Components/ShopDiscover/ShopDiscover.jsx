import React, { useState, useEffect, useContext } from 'react';
import './ShopDiscover.css';
import ShopHero from './ShopHero';
import ShopCategoryBar from './ShopCategoryBar';
import ShopFilterBar from './ShopFilterBar';
import ShopHorizontalSection from './ShopHorizontalSection';
import ShopProductGrid from './ShopProductGrid';
import { ShopContext } from '../../Context/ShopContext';
import API_BASE_URL from '../../config';

const ShopDiscover = () => {
    const { all_product } = useContext(ShopContext);
    const [sortOrder, setSortOrder] = useState('rating');
    const [filters, setFilters] = useState({});
    const [bestSellers, setBestSellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [trending, setTrending] = useState([]);
    const [productFeedbacks, setProductFeedbacks] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch feedbacks for all products
    useEffect(() => {
        if (!all_product || all_product.length === 0) return;

        const fetchFeedbacks = async () => {
            setLoading(true);
            try {
                const feedbacksPromises = all_product.map(async (product) => {
                    const feedbackResponse = await fetch(`${API_BASE_URL}/get-feedbacks/${product.id}`);
                    const feedbackData = await feedbackResponse.json();
                    return { productId: product.id, feedbacks: feedbackData };
                });

                const allFeedbacks = await Promise.all(feedbacksPromises);
                const feedbacksObj = allFeedbacks.reduce((acc, curr) => {
                    acc[curr.productId] = curr.feedbacks;
                    return acc;
                }, {});

                setProductFeedbacks(feedbacksObj);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
            }
            setLoading(false);
        };

        fetchFeedbacks();
    }, [all_product]);

    // Derive sections from all_product with feedbacks
    useEffect(() => {
        if (!all_product || all_product.length === 0 || loading) return;

        // Attach feedbacks to each product
        const productsWithFeedbacks = all_product.map((p) => ({
            ...p,
            feedbacks: productFeedbacks[p.id] || [],
        }));

        // Best Sellers: sort by rating descending
        const sorted = [...productsWithFeedbacks].sort((a, b) => {
            const aFeedbacks = productFeedbacks[a.id] || [];
            const bFeedbacks = productFeedbacks[b.id] || [];
            const aRating = aFeedbacks.length
                ? aFeedbacks.reduce((sum, f) => sum + f.rating, 0) / aFeedbacks.length
                : 0;
            const bRating = bFeedbacks.length
                ? bFeedbacks.reduce((sum, f) => sum + f.rating, 0) / bFeedbacks.length
                : 0;
            return bRating - aRating;
        });
        setBestSellers(sorted.slice(0, 10));

        // New Arrivals: highest IDs
        const newest = [...productsWithFeedbacks].sort((a, b) => (b.id || 0) - (a.id || 0));
        setNewArrivals(newest.slice(0, 10));

        // Trending: first 10 products
        setTrending(productsWithFeedbacks.slice(0, 10));
    }, [all_product, productFeedbacks, loading]);

    const handleSortChange = (value) => {
        setSortOrder(value);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="shop-discover">
            {/* Hero Banner */}
            <ShopHero />

            {/* Category Navigation Bar */}
            <ShopCategoryBar />

            {/* Filter Bar */}
            <ShopFilterBar onSortChange={handleSortChange} onFilterChange={handleFilterChange} />

            {/* Horizontal Scrolling Sections */}
            <ShopHorizontalSection type="best-sellers" products={bestSellers} />
            <ShopHorizontalSection type="new-arrivals" products={newArrivals} />
            <ShopHorizontalSection type="trending" products={trending} />

            {/* Main Product Grid */}
            <ShopProductGrid
                products={all_product || []}
                productFeedbacks={productFeedbacks}
                sortOrder={sortOrder}
                filters={filters}
            />
        </div>
    );
};

export default ShopDiscover;
