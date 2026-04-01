import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './CSS/Admin.css';
import Sidebar from '../Components/Sidebar/Sidebar';
import ViewOrdersPage from '../Components/ViewOrdersPage/ViewOrdersPage';
import { AddProduct } from '../Components/AddProduct/AddProduct';
import ListProduct from '../Components/ListProduct/ListProduct';
import ManageAccountsPage from '../Components/ManageAccountsPage/ManageAccountsPage';
import StatisticPage from '../Components/StatisticPage/StatisticPage';
import ManageCategories from '../Components/ManageCategories/ManageCategories';

const Admin = () => {
    return (
        <div className='admin-page'>
            <Sidebar />
            <div className="admin-content">
                <Routes>
                    <Route path='/view-orders' element={<ViewOrdersPage />} />
                    <Route path='/add-product' element={<AddProduct />} />
                    <Route path='/list-product' element={<ListProduct />} />
                    <Route path='/manage-accounts' element={<ManageAccountsPage />} />
                    <Route path='/statistics' element={<StatisticPage />} />
                    <Route path='/manage-categories' element={<ManageCategories />} />
                </Routes>
            </div>
        </div>
    );
}

export default Admin;
