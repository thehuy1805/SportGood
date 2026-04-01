import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrum from '../Components/Breadcrums/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

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

  useEffect(() => {
    if (!all_product || !productSlug) return;
    const foundProduct = all_product.find(
      (e) => e && generateSlug(e.name) === productSlug
    );
    setProduct(foundProduct || null);
    setIsLoading(false);
  }, [productSlug, all_product]);

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
