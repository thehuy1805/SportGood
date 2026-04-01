  import React, { useState, useEffect } from 'react';
  import './RelatedProducts.css';
  import Item from '../Item/Item';
  import useProductStore from '../../store/productStore';

  const RelatedProducts = () => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const selectedProduct = useProductStore(state => state.selectedProduct);

    useEffect(() => {
      const fetchRelatedProducts = async () => {
        if (selectedProduct) {
          try {
            const response = await fetch('http://localhost:4000/allproducts');
            const data = await response.json();

            const filteredProducts = data.filter(item => 
              item.generalCategory === selectedProduct.generalCategory && item.id !== selectedProduct.id
            );

            const shuffledProducts = [...filteredProducts].sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffledProducts.slice(0, 4));
          } catch (error) {
            console.error("Error fetching related products:", error);
          }
        }
      };

      fetchRelatedProducts();
    }, [selectedProduct]);

    return (
      <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr />
        <div className="relatedproducts-item">
          {relatedProducts.map((item, i) => (
            <Item key={i} {...item} />
          ))}
        </div>
      </div>
    );
  };

  export default RelatedProducts;