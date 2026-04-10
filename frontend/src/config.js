// API Base URL - Tự động phát hiện môi trường
// Khi chạy local: http://localhost:4000
// Khi deploy lên Vercel: sử dụng biến môi trường REACT_APP_API_URL

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default API_BASE_URL;
