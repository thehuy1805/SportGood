import React, { useState, useEffect } from "react";
import FlipItem from '../FlipItem/FlipItem';
import './WomenProduct.css';
import API_BASE_URL from '../../config';

const WomenProduct = ({
  searchTerm,
  sortOrder,
  selectedCategory,
  detailedCategory,
  onCategoriesLoaded,
}) => {
  const [products, setProducts] = useState([]);
  const [productFeedbacks, setProductFeedbacks] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allproducts`);
        const data = await response.json();

        const womenProducts = data.filter(
          (product) => product.generalCategory === "Women"
        );
        setProducts(womenProducts);

        // Extract unique detailedCategory values
        const uniqueCategories = [...new Set(womenProducts.map(p => p.detailedCategory).filter(Boolean))];
        if (onCategoriesLoaded) {
          onCategoriesLoaded(uniqueCategories);
        }

        const feedbacksPromises = womenProducts.map(async (product) => {
          const feedbackResponse = await fetch(
            `${API_BASE_URL}/get-feedbacks/${product.id}`
          );
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
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [onCategoriesLoaded]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    const matchesDetailedCategory = detailedCategory
      ? product.detailedCategory === detailedCategory
      : true;
    return matchesSearch && matchesCategory && matchesDetailedCategory;
  });

  const calculateAverageRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / feedbacks.length;
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.new_price - b.new_price;
    } else if (sortOrder === "desc") {
      return b.new_price - a.new_price;
    } else if (sortOrder === "rating") {
      const aRating = calculateAverageRating(productFeedbacks[a.id]);
      const bRating = calculateAverageRating(productFeedbacks[b.id]);
      return bRating - aRating;
    }
    return 0;
  });

  // Get featured products for carousel
  const featuredProducts = [...products]
    .sort((a, b) => {
      const aRating = calculateAverageRating(productFeedbacks[a.id]);
      const bRating = calculateAverageRating(productFeedbacks[b.id]);
      return bRating - aRating;
    })
    .slice(0, 5);

  return (
    <div className="women-product-container">
      {/* Horizontal Carousel - Featured */}
      {featuredProducts.length > 0 && (
        <div className="featured-carousel">
          <div className="carousel-header">
            <span className="carousel-title">Featured Picks</span>
            <span className="carousel-subtitle">Curated for you</span>
          </div>
          <div className="carousel-track">
            {featuredProducts.map((product) => (
              <div key={product.id} className="carousel-item">
                <FlipItem
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  new_price={product.new_price}
                  old_price={product.old_price}
                  feedbacks={productFeedbacks[product.id]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Header */}
      <div className="products-header">
        <span className="products-count">
          Showing <span>{sortedProducts.length}</span> products
        </span>
      </div>

      {/* Grid with alternating layout */}
      <div className="products-grid">
        {sortedProducts.map((product, index) => (
          <div 
            key={product.id} 
            className={`product-item ${index % 5 === 0 ? 'featured' : ''}`}
          >
            <FlipItem
              id={product.id}
              name={product.name}
              image={product.image}
              new_price={product.new_price}
              old_price={product.old_price}
              feedbacks={productFeedbacks[product.id]}
            />
          </div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="no-products">
          <span className="no-products-icon">✨</span>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default WomenProduct;
