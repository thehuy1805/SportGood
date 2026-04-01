import React from 'react'
import './Popular.css'
import Item from '../Item/Item'
import { useState, useEffect } from 'react'

const Popular = () => {

  const [popularProducts, setPopularProducts] = useState([]);
  const [productFeedbacks, setProductFeedbacks] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/popularinwomen');
        const data = await response.json();

        const feedbacksPromises = data.map(async (item) => {
          const feedbackResponse = await fetch(`http://localhost:4000/get-feedbacks/${item.id}`);
          const feedbackData = await feedbackResponse.json();
          return { productId: item.id, feedbacks: feedbackData };
        });

        const allFeedbacks = await Promise.all(feedbacksPromises);
        const feedbacksObj = allFeedbacks.reduce((acc, curr) => {
          acc[curr.productId] = curr.feedbacks;
          return acc;
        }, {});

        setPopularProducts(data);
        setProductFeedbacks(feedbacksObj);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='pop-outer'>
      <div className='pop-header'>
        <div className='pop-number'>01</div>
        <div className='pop-header-left'>
          <span className='pop-eyebrow'>Discover</span>
          <h2 className='pop-title'>Popular in Women</h2>
          <p className='pop-subtitle'>Top picks chosen by our female customers</p>
        </div>
        <div className='pop-header-right'>
          <div className='pop-divider'></div>
        </div>
      </div>

      <div className="pop-grid">
        {popularProducts.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
              feedbacks={productFeedbacks[item.id]}
            />
          );
        })}
      </div>
    </div>
  )
}
export default Popular;
