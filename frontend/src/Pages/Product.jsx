import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrum from '../Components/Breadcrums/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';
import API_BASE_URL from '../config';

export const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productName: productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  // Always fetch fresh product data from backend to ensure latest stock/sizeStatus
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/allproducts`);
        const data = await res.json();
        const found = data.find(e => e && generateSlug(e.name) === productSlug);
        setProduct(found || null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  // Fallback: use context if API fetch fails (e.g. offline)
  useEffect(() => {
    if (product || isLoading) return;
    if (!all_product || !productSlug) return;
    const found = all_product.find(e => e && generateSlug(e.name) === productSlug);
    if (found) setProduct(found);
  }, [all_product, productSlug, product, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product is not available</div>;
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} feedbacks={feedbacks} />
      <DescriptionBox
        description={product.description}
        productId={product.id}
        product={product}
        onFeedbacksChange={setFeedbacks}
      />
      <RelatedProducts />
    </div>
  );
};

export default Product;
