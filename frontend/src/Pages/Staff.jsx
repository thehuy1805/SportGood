import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import './CSS/Staff.css';
import StaffSidebar from '../Components/StaffSidebar/StaffSidebar';
import ManageOrdersPage from '../Components/ManageOrdersPage/ManageOrdersPage';
import ManageInventoryPage from '../Components/ManageInventoryPage/ManageInventoryPage';

const Staff = () => {
    return (
        <StaffSidebar>
            <Routes>
                <Route path='/manage-orders' element={<ManageOrdersPage />} />
                <Route path='/manage-inventory' element={<ManageInventoryPage />} />
            </Routes>
        </StaffSidebar>
    );
}

export default Staff;
