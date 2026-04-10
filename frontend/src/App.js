import './App.css';
import Navbar from './Components/Navbar/Navbar';
import AboutUs from './Components/AboutUs/AboutUs';
import Contact from './Components/Contact/Contact';
import SizeGuide from './Components/SizeGuide/SizeGuide';
import ChatBot from './Components/ChatBot/ChatBot';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import Shop from './Pages/Shop';
import HomeShop from './Pages/HomeShop';
import Men from './Pages/Men';
import Women from './Pages/Women';
import SportsEquipment from './Pages/SportsEquipment';
import ShopCategory from './Pages/ShopCategory';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Product from './Pages/Product';
import Admin from './Pages/Admin';
import UpdateProduct from './Components/UpdateProduct/UpdateProduct';
import Staff from './Pages/Staff';
import CheckoutPage from './Pages/CheckoutPage';
import OrderConfirmationPage from './Pages/OrderConfirmationPage';
import OrderHistoryPage from './Pages/OrderHistoryPage';
import MyProfilePage from './Pages/MyProfilePage';
import AddressBookPage from './Pages/AddressBookPage';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner_video from './Components/Assets/women_banner_video.mp4';
import { AuthContext } from './Context/AuthContext';
import { UserRoute, StaffRoute, AdminRoute } from './Components/PrivateRoute/PrivateRoute';

function AppContent() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isLogout = searchParams.get('logout');
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        if (isLogout) {
            logout();
        }
    }, [isLogout, logout]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Shop />} />
            <Route path='/shop' element={<HomeShop />} />
            <Route path='/men' element={<Men />} />
            <Route path='/women' element={<Women />} />
            <Route path='/sport-equipment' element={<SportsEquipment />} />
            <Route path='/login' element={<LoginSignup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            
            {/* Product Routes */}
            <Route path="/product/:productName" element={<Product />} />
            
            {/* Category Routes */}
            <Route 
                path='/sportswear/:category' 
                element={<ShopCategory media={women_banner_video} category="Gym Sets" />} 
            />
            <Route 
                path='/sports-shoes/:category' 
                element={<ShopCategory media={men_banner} category="Gym Sets" />} 
            />
            <Route 
                path='/sports-equipment/:category' 
                element={<ShopCategory />} 
            />
            <Route 
                path='/protective-equipment/:category' 
                element={<ShopCategory />} 
            />
            <Route 
                path='/sports-accessories/:category' 
                element={<ShopCategory />} 
            />

            {/* Protected User Routes */}
            <Route
                path='/cart'
                element={
                    <UserRoute>
                        <Cart />
                    </UserRoute>
                }
            />
            <Route
                path='/checkout'
                element={
                    <UserRoute>
                        <CheckoutPage />
                    </UserRoute>
                }
            />
            <Route
                path='/order-confirmation'
                element={
                    <UserRoute>
                        <OrderConfirmationPage />
                    </UserRoute>
                }
            />
            <Route
                path='/order-history'
                element={
                    <UserRoute>
                        <OrderHistoryPage />
                    </UserRoute>
                }
            />
            <Route
                path='/my-profile'
                element={
                    <UserRoute>
                        <MyProfilePage />
                    </UserRoute>
                }
            />
            <Route
                path='/address-book'
                element={
                    <UserRoute>
                        <AddressBookPage />
                    </UserRoute>
                }
            />


            {/* Protected Staff Routes */}
            <Route
                path='/staff/*'
                element={
                    <StaffRoute>
                        <Staff />
                    </StaffRoute>
                }
            />

            {/* Protected Admin Routes */}
            <Route
                path='/admin/*'
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            />

            <Route
                path="/update-product/:id"
                element={
                    <AdminRoute>
                        <UpdateProduct />
                    </AdminRoute>
                }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    const location = useLocation();
    // Chỉ ẩn Navbar/Footer trong khu vực admin & staff (có sidebar riêng).
    // Khi admin/staff xem shop, cart, v.v. vẫn hiển thị Navbar + Footer như người dùng thường.
    const isDashboardShell =
        location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');
    const showNavbarFooter = !isDashboardShell;

    return (
        <div>
                {showNavbarFooter && <Navbar />}

                <AppContent />

                {showNavbarFooter && <Footer />}

                <ChatBot />
        </div>
    );
}

export default App;