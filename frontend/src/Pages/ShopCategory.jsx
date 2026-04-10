import React, {useContext, useEffect, useState} from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom';
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'
import API_BASE_URL from '../config';

export const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  const { category: categoryParam } = useParams(); // Lấy category từ URL params
  const [products, setProducts] = useState([]);
  const isVideo = props.media.endsWith('.mp4');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${categoryParam || props.category}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [categoryParam, props.category]); 
  return (
    <div className='shop-category'>
      {isVideo ? (
        <video className='shopcategory-banner' autoPlay loop muted>
          <source src={props.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img className='shopcategory-banner' src={props.media} alt="" />
      )}
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-12</span> out of 36 products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className="shopcategory-products">
        {all_product.map((item,i)=> {
          if   (props.category===item.category){
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
          }
          else{
            return null;
          }
        })}
      </div>
      <div className="shopcategory-loadmore">
        Explore More
      </div>
    </div>
  )
}
export default ShopCategory;