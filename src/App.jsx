import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminPortal from './pages/AdminPortal';
import api from './services/api';

export default function App() {
  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Shopping cart state initialized from localStorage as fallback
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Cart Drawer open/close state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const data = await api.get('/api/auth/me');
          setUser(data);
          // Set cart from database
          if (data.cart) {
            const dbCart = data.cart.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
              quantity: item.quantity
            }));
            setCart(dbCart);
          }
        } catch (error) {
          console.error('Session expired or invalid token', error);
          handleLogout();
        }
      }
    };
    loadProfile();
  }, [token]);

  // Sync cart state to database if user is logged in
  useEffect(() => {
    if (user && token) {
      const syncCart = async () => {
        try {
          const cartPayload = cart.map(item => ({ id: item.id, quantity: item.quantity }));
          await api.put('/api/cart', { cartItems: cartPayload });
        } catch (error) {
          console.error('Failed to sync cart to DB', error);
        }
      };

      const timeoutId = setTimeout(syncCart, 500);
      return () => clearTimeout(timeoutId);
    } else if (!token) {
      // If guest user, store in localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user, token]);

  const handleLoginSuccess = async (userData) => {
    localStorage.setItem('token', userData.token);
    setToken(userData.token);
    setUser(userData);
    
    // Merge guest cart
    try {
      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (guestCart.length > 0) {
        const mergedDbCart = await api.post('/api/cart/merge', { guestCart });
        const mappedCart = mergedDbCart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          category: item.product.category,
          quantity: item.quantity
        }));
        setCart(mappedCart);
        localStorage.removeItem('cart'); // Clear guest cart
      } else if (userData.cart) {
        const dbCart = userData.cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          category: item.product.category,
          quantity: item.quantity
        }));
        setCart(dbCart);
      }
    } catch (err) {
      console.error('Error merging cart on login:', err);
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // Auto-open cart drawer when adding item
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setCart([]);
  };

return (
  <Router>
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={
          <Login
            user={user}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />

      {/* Signup */}
      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          token && user?.isAdmin
            ? <AdminPortal user={user} onLogout={handleLogout} />
            : <Navigate to="/" replace />
        }
      />

      {/* Main Website */}
      <Route
        path="*"
        element={
          <div className="flex flex-col min-h-screen bg-pink-50 text-gray-800">
            <Header
              user={user}
              onLogout={handleLogout}
              cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              onCartClick={() => setIsCartOpen(true)}
            />

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/products"
                  element={
                    <Products
                      addToCart={addToCart}
                      user={user}
                      token={token}
                    />
                  }
                />

                <Route
                  path="/profile"
                  element={
                    token ? (
                      <Profile
                        user={user}
                        setUser={setUser}
                        onLogout={handleLogout}
                      />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />

            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cart}
              updateQuantity={updateCartQuantity}
              removeItem={removeFromCart}
              clearCart={clearCart}
            />
          </div>
        }
      />
    </Routes>
  </Router>
);
}
