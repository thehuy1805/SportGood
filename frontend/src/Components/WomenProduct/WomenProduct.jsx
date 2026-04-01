import React, { useState, useEffect } from "react";
import Item from "../../Components/Item/Item";
import '../../Components/AllProduct/AllProduct.css';

const WomenProduct = ({
  searchTerm,
  sortOrder,
  selectedCategory,
  detailedCategory,
}) => {
  const [products, setProducts] = useState([]);
  const [productFeedbacks, setProductFeedbacks] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/allproducts");
        const data = await response.json();

        // Lọc sản phẩm có generalCategory là "Women"
        const womenProducts = data.filter(
          (product) => product.generalCategory === "Women"
        );
        setProducts(womenProducts);

        // Fetch feedbacks cho tất cả sản phẩm Women
        const feedbacksPromises = womenProducts.map(async (product) => {
          const feedbackResponse = await fetch(
            `http://localhost:4000/get-feedbacks/${product.id}`
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
  }, []);

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
    return (
      matchesSearch && matchesCategory && matchesDetailedCategory
    );
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
      return bRating - aRating; // Sắp xếp theo rating
    }
    return 0;
  });

  return (
    <div className="product-grid">
      {sortedProducts.map((product) => (
        <Item
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image}
          new_price={product.new_price}
          old_price={product.old_price}
          feedbacks={productFeedbacks[product.id]}
        />
      ))}
    </div>
  );
};

export default WomenProduct;