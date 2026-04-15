import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ShopContextProvider from './Context/ShopContext';
import AuthContextProvider from './Context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* BrowserRouter used in index.js */}
      <AuthContextProvider>
        <ShopContextProvider>
          <App /> 
        </ShopContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Kiểm tra hiệu suất ứng dụng bằng cách truyền một hàm
// để ghi kết quả (ví dụ: reportWebVitals(console.log))
// hoặc gửi đến một endpoint phân tích. Xem thêm: https://bit.ly/CRA-vitals
reportWebVitals();