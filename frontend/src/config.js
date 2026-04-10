    // API Base URL - Tự động phát hiện môi trường
// Khi deploy lên Vercel: sử dụng biến môi trường REACT_APP_API_URL
// Production Backend URL: https://sportgood.onrender.com

// Vercel sẽ inject biến REACT_APP_* vào browser bundle tại thời điểm build
// Fallback về localhost:4000 nếu không có biến môi trường
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default API_BASE_URL;
