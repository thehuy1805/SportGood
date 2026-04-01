import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import './StatisticPage.css';

const StatisticPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('http://localhost:4000/admin/get-orders', {
            headers: { 'auth-token': localStorage.getItem('auth-token') }
          }),
          fetch('http://localhost:4000/allproducts')
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        const pd = await productsRes.json();
        setProducts(pd);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  const orderDataByDate = orders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const orderChartData = Object.keys(orderDataByDate).map(date => ({
    name: date, orders: orderDataByDate[date]
  }));

  const productDataByCategory = products.reduce((acc, product) => {
    acc[product.generalCategory] = (acc[product.generalCategory] || 0) + 1;
    return acc;
  }, {});

  const productChartData = Object.keys(productDataByCategory).map(category => ({
    name: category, products: productDataByCategory[category]
  }));

  const revenueByDate = orders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + order.totalAmount;
    return acc;
  }, {});

  const revenueChartData = Object.keys(revenueByDate).map(date => ({
    name: date, revenue: revenueByDate[date]
  }));

  const productQuantity = orders.reduce((acc, order) => {
    order.products.forEach(product => {
      acc[product.productId] = (acc[product.productId] || 0) + product.quantity;
    });
    return acc;
  }, {});

  const topProducts = Object.keys(productQuantity)
    .map(productId => ({ productId: parseInt(productId), quantity: productQuantity[productId] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topProductChartData = topProducts.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      name: product ? (product.name.length > 15 ? product.name.slice(0, 15) + '…' : product.name) : `Product ${item.productId}`,
      quantity: item.quantity
    };
  });

  const COLORS = ['#f97316', '#fb923c', '#fbbf24', '#34d399', '#60a5fa'];

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div style={{ padding: '32px' }}>
      <div className="stat-header">
        <div className="stat-title">
          <div className="stat-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <h1>Business Statistics</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            background: '#1e293b', borderRadius: 12, padding: '12px 20px',
            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>${totalRevenue.toFixed(2)}</span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Revenue</span>
          </div>
          <div style={{
            background: '#1e293b', borderRadius: 12, padding: '12px 20px',
            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>{orders.length}</span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Orders</span>
          </div>
          <div style={{
            background: '#1e293b', borderRadius: 12, padding: '12px 20px',
            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>{products.length}</span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Products</span>
          </div>
        </div>
      </div>

      <div className="stat-charts-grid">
        <div className="stat-chart-card">
          <div className="stat-chart-header">
            <div className="stat-chart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 className="stat-chart-title">Orders by Date</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={orderChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10 }} />
              <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-chart-card">
          <div className="stat-chart-header">
            <div className="stat-chart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 className="stat-chart-title">Revenue by Date</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10 }} />
              <Bar dataKey="revenue" fill="#4ade80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-chart-card">
          <div className="stat-chart-header">
            <div className="stat-chart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="stat-chart-title">Top 5 Best-selling Products</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={topProductChartData} dataKey="quantity" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} label>
                {topProductChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-chart-card">
          <div className="stat-chart-header">
            <div className="stat-chart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"></path>
              </svg>
            </div>
            <h3 className="stat-chart-title">Products by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={productChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10 }} />
              <Bar dataKey="products" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticPage;
