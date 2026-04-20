import React, {useContext, useEffect, useState} from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom';
import Item from '../Components/Item/Item'
import API_BASE_URL from '../config';

export const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  const { category: categoryParam } = useParams(); // Lấy category từ URL params
  const [products, setProducts] = useState([]);
  const isVideo = props.media?.endsWith('.mp4');

  // Determine the actual category to filter: URL param overrides props.category
  // Normalize URL slug (kebab-case) to title case: 'gym-sets' → 'Gym Sets'
  const activeCategory = categoryParam
    ? categoryParam
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : props.category;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${activeCategory}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  return (
    <div className='shop-category'>
      {isVideo ? (
        <video className='shopcategory-banner' autoPlay loop muted>
          <source src={props.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : props.media ? (
        <img className='shopcategory-banner' src={props.media} alt="" />
      ) : null}

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{Math.min(products.length, 12)}</span> out of {products.length} products
        </p>
        <div className="shopcategory-sort">
          Sort by <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div className="shopcategory-products">
        {products.length > 0 ? (
          products.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
              generalCategory={item.generalCategory}
              detailedCategory={item.detailedCategory}
              sizeStatus={item.sizeStatus}
            />
          )
        )) : (
          <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', width: '100%' }}>
            No products found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
export default ShopCategory;