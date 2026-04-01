import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrum.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

const Breadcrum = ({ product }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Chuyển đổi category thành chữ thường và điều hướng
    navigate(`/${category.toLowerCase()}`); 
  };

  return (
    <div className="breadcrum">
      <span onClick={() => navigate('/')}>HOME</span>
      <img src={arrow_icon} alt="" /> 
      <span onClick={() => navigate('/shop')}>SHOP</span>
      <img src={arrow_icon} alt="" /> 
      <span onClick={() => handleCategoryClick(product.generalCategory)}>
        {product.generalCategory}
      </span>
      <img src={arrow_icon} alt="" /> 
      {product.name}
    </div>
  );
};

export default Breadcrum;