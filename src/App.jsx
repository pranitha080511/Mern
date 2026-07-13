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

export default function App() {
  // Authentication state initialized from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Shopping cart state initialized from localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Cart Drawer open/close state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
  };

  return (
    <Router>
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
            <Route path="/products" element={<Products addToCart={addToCart} />} />
            <Route 
              path="/profile" 
              element={
                user ? (
                  <Profile user={user} setUser={setUser} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/login" element={<Login user={user} setUser={setUser} />} />
            <Route path="/signup" element={<Signup />} />
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
    </Router>
  );
}
