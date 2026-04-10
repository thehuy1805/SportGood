    // API Base URL - Tự động phát hiện môi trường
// Khi chạy local: http://localhost:4000
// Khi deploy lên Vercel: sử dụng biến môi trường REACT_APP_API_URL
// Production: https://sport-good-e43j.vercel.app (Vercel Frontend) -> Backend Render URL

// Tự động phát hiện môi trường
const getApiBaseUrl = () => {
    // 1. Nếu có biến môi trường REACT_APP_API_URL (deploy lên Vercel)
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // 2. Nếu đang chạy trên Vercel (không có domain local)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Đang chạy trên production - cần backend URL
        return 'https://sportgood.onrender.com';
    }

    // 3. Default: local development
    return 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
