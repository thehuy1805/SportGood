import React from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
import {useState} from 'react'
import {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'

const NewCollections = () => {
const [new_collection,setNew_collection] = useState([]);
const [productFeedbacks, setProductFeedbacks] = useState({});
const navigate = useNavigate();

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/newcollections`);
      const data = await response.json();
      setNew_collection(data);

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

      setProductFeedbacks(feedbacksObj);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

return (
    <div id="new-arrivals-section" className='nc-outer'>
    <div className='nc-header'>
      <div className='nc-number'>02</div>
      <div className='nc-header-text'>
        <p className='nc-eyebrow'>Just Landed</p>
        <h2 className='nc-title'>New Collections</h2>
        <p className='nc-desc'>Fresh drops you don't want to miss. Grab them before they're gone.</p>
      </div>
    </div>

    <div className="nc-grid">
      {new_collection.map((item) => (
        <Item
          key={item.id}
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
      ))}
    </div>

    <div className='nc-footer'>
      <button className='nc-btn' onClick={() => navigate('/shop')}>
        View All New Arrivals
        <span className='nc-btn-arrow'>→</span>
      </button>
    </div>
  </div>
);
};
export default NewCollections;
