import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import io from 'socket.io-client';

export const ShopContext = createContext(null);

export const ShopContextProvider = ({ children }) => {
    const [all_product, setAll_product] = useState([]);
    const [cart, setCart] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});
    const { isLoggedIn, userName, userId, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Kết nối Socket.IO
    const socket = io('http://localhost:4000'); 

    // Fetch all products
    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsResponse = await fetch('http://localhost:4000/allproducts');
                const productsData = await productsResponse.json();
                setAll_product(productsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Socket: refresh all_product khi staff cập nhật kho
    useEffect(() => {
        const refreshProducts = async () => {
            try {
                const res = await fetch('http://localhost:4000/allproducts');
                const data = await res.json();
                setAll_product(data);
            } catch (err) {
                console.error('Socket refresh error:', err);
            }
        };
        socket.on('categoriesUpdated', refreshProducts);
        return () => { socket.off('categoriesUpdated', refreshProducts); };
    }, []);

    // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Lấy giỏ hàng từ localStorage khi trang được tải lại
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            setCart(parsedCart);
        }
    }, []);


 // Đồng bộ giỏ hàng với server khi người dùng đã đăng nhập
useEffect(() => {
    const syncCartWithServer = async () => {
        if (isLoggedIn) {
            try {
                const token = localStorage.getItem('auth-token');
                if (token) {
                    // Lấy giỏ hàng từ server
                    const cartResponse = await fetch('http://localhost:4000/getcart', {
                        method: 'GET',
                        headers: {
                            'auth-token': token,
                            'Content-Type': 'application/json',
                        }
                    });
                    const serverCart = await cartResponse.json();

                    // Lấy giỏ hàng từ localStorage
                    const localCart = JSON.parse(localStorage.getItem('cart')) || {};

                    // Merge giỏ hàng
                    const mergedCart = { ...serverCart };
                    
                    // Thêm các sản phẩm từ local cart vào merged cart
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
                    await fetch('http://localhost:4000/updatecart', {
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

useEffect(() => {
    const handleStockUpdate = (updatedProducts) => {
        setAll_product(prevProducts => {
            return prevProducts.map(product => {
                const updated = updatedProducts.find(p => p.id === product.id);
                if (updated) {
                    // Deep copy to ensure we update sizeStatus correctly
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
            const productsResponse = await fetch('http://localhost:4000/allproducts');
            const productsData = await productsResponse.json();
            setAll_product(productsData);
        } catch (error) {
            console.error('Error refetching products:', error);
        }
    };

    socket.on('categoriesUpdated', handleCategoriesUpdated);

    // Dọn dẹp lắng nghe sự kiện khi component unmount
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
                        delete updatedCart[itemId]; // Xóa sản phẩm nếu không còn size nào
                    }
                }
            } else {
                if (!updatedCart[itemId]) {
                    updatedCart[itemId] = {};
                }
                updatedCart[itemId][size] = quantity;
            }
    
            // Cập nhật lại localStorage ngay sau khi thay đổi giỏ hàng
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

        // Đồng bộ giỏ hàng với server nếu người dùng đã đăng nhập
        if (isLoggedIn) {
            try {
                // Lấy toàn bộ giỏ hàng hiện tại
                const token = localStorage.getItem('auth-token');
                const cartResponse = await fetch('http://localhost:4000/getcart', {
                    method: 'GET',
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'application/json',
                    }
                });
                const serverCart = await cartResponse.json();
    
                // Tạo bản sao của giỏ hàng từ server
                const updatedServerCart = { ...serverCart };
    
                // Cập nhật số lượng sản phẩm
                if (!updatedServerCart[itemId]) {
                    updatedServerCart[itemId] = {};
                }
                updatedServerCart[itemId][effectiveSize] = 
                    (updatedServerCart[itemId][effectiveSize] || 0) + 1;
    
                // Gửi giỏ hàng đã cập nhật lên server
                await fetch('http://localhost:4000/updatecart', {
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

            // Nếu số lượng của size này về 0
            if (updatedCart[itemId][size] === 0) {
                // Xóa size này
                delete updatedCart[itemId][size];

                // Nếu không còn size nào cho sản phẩm này, xóa luôn sản phẩm
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

    // Nếu đang đăng nhập, cập nhật cart trên server
    if (isLoggedIn) {
        try {
            const token = localStorage.getItem('auth-token');
            fetch('http://localhost:4000/updatecart', {
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
    
        // Cập nhật lại localStorage ngay lập tức khi giỏ hàng bị xóa
        localStorage.setItem('cart', JSON.stringify({}));
    
        // Đồng bộ giỏ hàng với server nếu người dùng đã đăng nhập
        if (isLoggedIn) {
            try {
                await fetch('http://localhost:4000/clearcart', {
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

    // Context value
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
        updateCartItemQuantity 
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
