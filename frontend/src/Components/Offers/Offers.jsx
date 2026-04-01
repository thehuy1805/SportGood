import React from 'react'
import './Offers.css'
import exclusive_image from '../Assets/exclusive_image.png'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
        <p className="offers-eyebrow">Don't Miss Out</p>
        <h1>Exclusive</h1>
        <h1>Offer For You</h1>
        <p>Only on best seller product</p>
        <button>Claim Offer →</button>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="" />
      </div>
    </div>
  )
}
export default Offers;
