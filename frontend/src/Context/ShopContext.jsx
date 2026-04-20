import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import API_BASE_URL from '../config';

export const ShopContext = createContext(null);

export const ShopContextProvider = ({ children }) => {
    const [all_product, setAll_product] = useState([]);
    const [cart, setCart] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});
    const [wishlist, setWishlist] = useState([]); // Danh sách yêu thích: mảng các productId
    const { isLoggedIn, userName, userId, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Kết nối Socket.IO
    const socket = io(API_BASE_URL);

    // Lấy tất cả sản phẩm (cũng dùng để refresh khi cần)
    const fetchProducts = async () => {
        try {
            const productsResponse = await fetch(`${API_BASE_URL}/allproducts`);
            const productsData = await productsResponse.json();
            setAll_product(productsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Lấy giỏ hàng từ localStorage khi trang tải lại
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            setCart(parsedCart);
        }
    }, []);


 // Đồng bộ giỏ hàng với server khi người dùng đăng nhập
useEffect(() => {
    const syncCartWithServer = async () => {
        if (isLoggedIn) {
            try {
                const token = localStorage.getItem('auth-token');
                if (token) {
                    // Lấy giỏ hàng từ server
                    const cartResponse = await fetch(`${API_BASE_URL}/getcart`, {
                        method: 'GET',
                        headers: {
                            'auth-token': token,
                            'Content-Type': 'application/json',
                        }
                    });
                    const serverCart = await cartResponse.json();

                    // Lấy giỏ hàng từ localStorage
                    const localCart = JSON.parse(localStorage.getItem('cart')) || {};

                    // Gộp giỏ hàng
                    const mergedCart = { ...serverCart };

                    // Thêm sản phẩm từ giỏ hàng cục bộ vào giỏ hàng đã gộp
                    for (const productId in localCart) {
                        if (!mergedCart[productId]) {
                            mergedCart[productId] = localCart[productId];
                        } else {
                            for (const size in localCart[productId]) {
                                mergedCart[productId][size] =
                                    (mergedCart[productId][size] || 0) +
                                    localCart[productId][size];
                            }
                        }
                    }

                    // Cập nhật giỏ hàng trên server
                    await fetch(`${API_BASE_URL}/updatecart`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': token
                        },
                        body: JSON.stringify({ cart: mergedCart })
                    });

                    // Cập nhật state và localStorage
                    setCart(mergedCart);
                    localStorage.setItem('cart', JSON.stringify(mergedCart));
                }
            } catch (error) {
                console.error('Error syncing cart:', error);
            }
        } else {
            // Nếu chưa đăng nhập, lấy giỏ hàng từ localStorage
            const storedCart = JSON.parse(localStorage.getItem('cart')) || {};
            setCart(storedCart);
        }
    };

    syncCartWithServer();
}, [isLoggedIn]);

// Lấy danh sách yêu thích khi đăng nhập
useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
        setWishlist([]);
        return;
    }
    const loadWishlist = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/wishlist`, {
                headers: { 'auth-token': token }
            });
            const data = await res.json();
            if (data.success) {
                setWishlist(data.wishlist.map(item => Number(item.productId)));
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };
    loadWishlist();
}, [isLoggedIn]);

useEffect(() => {
    const handleStockUpdate = (updatedProducts) => {
        setAll_product(prevProducts => {
            return prevProducts.map(product => {
                const updated = updatedProducts.find(p => p.id === product.id);
                if (updated) {
                    // Sao chép sâu để đảm bảo cập nhật sizeStatus đúng
                    const updatedProduct = { ...product };
                    if (updated.sizeStatus) {
                        updatedProduct.sizeStatus = updated.sizeStatus;
                    }
                    if (updated.stock !== undefined) {
                        updatedProduct.stock = updated.stock;
                    }
                    return updatedProduct;
                }
                return product;
            });
        });
    };

    socket.on('stockUpdated', handleStockUpdate);

    const handleCategoriesUpdated = async () => {
        try {
            const productsResponse = await fetch(`${API_BASE_URL}/allproducts`);
            const productsData = await productsResponse.json();
            setAll_product(productsData);
        } catch (error) {
            console.error('Error refetching products:', error);
        }
    };

    socket.on('categoriesUpdated', handleCategoriesUpdated);

    // Dọn dẹp event listeners khi component unmount
    return () => {
        socket.off('stockUpdated', handleStockUpdate);
        socket.off('categoriesUpdated', handleCategoriesUpdated);
    };
}, []);

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    const updateCartItemQuantity = async (itemId, size, quantity) => {
        setCart(prevCart => {
            const updatedCart = { ...prevCart };

            if (quantity <= 0) {
                // Xóa sản phẩm khi số lượng bằng 0
                if (updatedCart[itemId]) {
                    if (updatedCart[itemId][size]) {
                        delete updatedCart[itemId][size];
                    }
                    if (Object.keys(updatedCart[itemId]).length === 0) {
                        delete updatedCart[itemId]; // Xóa sản phẩm nếu không còn kích thước nào
                    }
                }
            } else {
                if (!updatedCart[itemId]) {
                    updatedCart[itemId] = {};
                }
                updatedCart[itemId][size] = quantity;
            }

            // Cập nhật localStorage ngay sau khi giỏ hàng thay đổi
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = async (itemId, selectedSize) => {
        const product = all_product.find(p => p.id === itemId);
        if (!product) return;

        const effectiveSize = product.generalCategory === 'Sports Equipment' ? 'default' : selectedSize;

        const currentQuantity = cart[itemId]?.[effectiveSize] || 0;

        setCart(prevCart => {
            const updatedCart = { ...prevCart };
            if (!updatedCart[itemId]) {
                updatedCart[itemId] = {};
            }
            updatedCart[itemId][effectiveSize] = currentQuantity + 1;
            return updatedCart;
        });

        // Sync cart with server if user is logged in
        if (isLoggedIn) {
            try {
                // Lấy giỏ hàng hiện tại đầy đủ
                const token = localStorage.getItem('auth-token');
                const cartResponse = await fetch(`${API_BASE_URL}/getcart`, {
                    method: 'GET',
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'application/json',
                    }
                });
                const serverCart = await cartResponse.json();

                // Tạo bản sao giỏ hàng từ server
                const updatedServerCart = { ...serverCart };

                // Cập nhật số lượng sản phẩm
                if (!updatedServerCart[itemId]) {
                    updatedServerCart[itemId] = {};
                }
                updatedServerCart[itemId][effectiveSize] =
                    (updatedServerCart[itemId][effectiveSize] || 0) + 1;

                // Gửi giỏ hàng đã cập nhật đến server
                await fetch(`${API_BASE_URL}/updatecart`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token,
                    },
                    body: JSON.stringify({ cart: updatedServerCart }),
                });
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }
    };


const removeFromCart = (itemId, size) => {
    setCart(prevCart => {
        const updatedCart = { ...prevCart };
        const currentQuantity = updatedCart[itemId]?.[size] || 0;

        if (currentQuantity > 0) {
            // Giảm số lượng
            updatedCart[itemId][size] -= 1;

            // Nếu số lượng kích thước này bằng 0
            if (updatedCart[itemId][size] === 0) {
                // Xóa kích thước này
                delete updatedCart[itemId][size];

                // Nếu không còn kích thước nào cho sản phẩm này, xóa sản phẩm
                if (Object.keys(updatedCart[itemId]).length === 0) {
                    delete updatedCart[itemId];
                }
            }

            // Cập nhật localStorage ngay lập tức
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            return updatedCart;
        }

        return prevCart;
    });

    // Nếu đã đăng nhập, cập nhật giỏ hàng trên server
    if (isLoggedIn) {
        try {
            const token = localStorage.getItem('auth-token');
            fetch(`${API_BASE_URL}/updatecart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({ cart: JSON.parse(localStorage.getItem('cart')) })
            });
        } catch (error) {
            console.error('Error updating cart on server:', error);
        }
    }
};


    // Xóa tất cả sản phẩm khỏi giỏ hàng
    const clearCart = async () => {
        setCart({});
        setSelectedSizes({});

        // Cập nhật localStorage ngay khi giỏ hàng bị xóa
        localStorage.setItem('cart', JSON.stringify({}));

        // Sync cart with server if user is logged in
        if (isLoggedIn) {
            try {
                await fetch(`${API_BASE_URL}/clearcart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('auth-token')
                    }
                });
            } catch (error) {
                console.error('There was a problem clearing the cart:', error);
            }
        }
    };

    // ============================================================
    // QUẢN LÝ DANH SÁCH YÊU THÍCH
    // ============================================================

    // Bật/tắt yêu thích: thêm nếu chưa có, xóa nếu đã có
    const toggleWishlist = async (productId) => {
        const pid = Number(productId);

        if (!isLoggedIn) {
            if (window.confirm('Please log in to add products to your wishlist!')) {
                navigate('/login');
            }
            return;
        }

        const token = localStorage.getItem('auth-token');
        const isCurrentlyInWishlist = wishlist.includes(pid);

            // Cập nhật UI ngay lập tức
            if (isCurrentlyInWishlist) {
            setWishlist(prev => prev.filter(id => id !== pid));
        } else {
            setWishlist(prev => [...prev, pid]);
        }

        try {
            const endpoint = isCurrentlyInWishlist ? 'remove' : 'add';
            const res = await fetch(`${API_BASE_URL}/wishlist/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({ productId: pid })
            });
            const data = await res.json();
            if (data.success) {
                // Đồng bộ lại từ server để đảm bảo chính xác
                setWishlist(data.wishlist.map(item => Number(item.productId)));
            } else {
                // Hoàn nguyên nếu server trả về lỗi
                if (isCurrentlyInWishlist) {
                    setWishlist(prev => [...prev, pid]);
                } else {
                    setWishlist(prev => prev.filter(id => id !== pid));
                }
                if (data.error) {
                    toast.error(data.error);
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            // Hoàn nguyên cập nhật UI
            if (isCurrentlyInWishlist) {
                setWishlist(prev => [...prev, pid]);
            } else {
                setWishlist(prev => prev.filter(id => id !== pid));
            }
        }
    };

    const isInWishlist = (productId) => wishlist.includes(Number(productId));

    const getWishlistCount = () => wishlist.length;
    

    // Tính tổng số sản phẩm trong giỏ hàng
    const getTotalCartItems = () => {
        let total = 0;
        for (const itemId in cart) {
            for (const size in cart[itemId]) {
                total += cart[itemId][size];
            }
        }
        return total;
    };

    // Tính tổng giá trị giỏ hàng
    const getTotalCartAmount = () => {
        let amount = 0;
        for (const itemId in cart) {
            const item = all_product.find(e => e.id === parseInt(itemId));
            if (item) {
                for (const size in cart[itemId]) {
                    amount += item.new_price * cart[itemId][size];
                }
            }
        }
        return amount;
    };

    // Giá trị context
    const contextValue = {
        getTotalCartAmount,
        all_product,
        cartItems: cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalCartItems,
        isLoggedIn,
        userName,
        userId,
        selectedSizes,
        cart,
        updateCartItemQuantity,
        wishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistCount,
        fetchProducts,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
