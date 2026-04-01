import React, { useContext, useState, useEffect} from 'react';
import { useNavigate, Link  } from 'react-router-dom';
import './NavbarStaff.css'; 
import navlogo from '../Assets/staff_page_icon.png';
import { AuthContext } from '../../Context/AuthContext'; 


const NavbarStaff = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);


    const handleLogout = () => {
        logout(); 
        window.location.replace('/');
    };

    return (
        <div className='navbar-staff'> 
            <img src={navlogo} alt="" className="nav-logo" />
            <Link to="/staff/manage-orders" style={{ textDecoration: 'none' }}>
                <span>Manage Order</span>
            </Link>
            <Link to="/staff/manage-inventory" style={{ textDecoration: 'none' }}>
                 <span>Manage Inventory</span>
            </Link>
            <button onClick={handleLogout} className='logout-button'>Logout</button>
        </div>
    );
};

export default NavbarStaff;