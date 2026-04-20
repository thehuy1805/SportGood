import React from 'react'
import './Popular.css'
import Item from '../Item/Item'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [productFeedbacks, setProductFeedbacks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/popularinwomen`);
        const data = await response.json();

        const feedbacksPromises = data.map(async (item) => {
          const feedbackResponse = await fetch(`${API_BASE_URL}/get-feedbacks/${item.id}`);
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
    <div id="popular-section" className='pop-outer'>
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
              generalCategory={item.generalCategory}
              detailedCategory={item.detailedCategory}
              sizeStatus={item.sizeStatus}
            />
          );
        })}
      </div>

      <div className="pop-footer">
        <button className="pop-btn" onClick={() => {
          const section = document.getElementById('new-arrivals-section');
          if (section) {
            const offset = section.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: 'smooth' });
          }
        }}>
          Browse Collections
          <span className="pop-btn-arrow">→</span>
        </button>
      </div>
    </div>
  )
}
export default Popular;
