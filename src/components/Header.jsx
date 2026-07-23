import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';

export default function Header({ user, onLogout, cartCount, onCartClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeClassName = "text-pink-400 border-b-2 border-pink-400 pb-1 transition duration-200 font-bold";
  const inactiveClassName = "text-gray-300 hover:text-pink-400 transition duration-200 pb-1";

  return (
    <header className="bg-black text-white sticky top-0 z-40 shadow-xl border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Left Side spacer or mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Center Brand Name */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Link to="/" className="group">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white font-serif group-hover:text-pink-400 transition duration-300">
                Hikari's Luxe
              </h1>
              <span className="text-xs sm:text-sm tracking-widest text-pink-300 uppercase block font-sans">
                Cosmetics World
              </span>
            </Link>
          </div>

          {/* Right Side Buttons (Cart & Authentication) */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-300 hover:text-pink-400 transition duration-300 focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-pink-600 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
                  <Link to="/profile" className="flex items-center space-x-2 text-pink-300 hover:text-pink-400 transition">
                    <User size={18} />
                    <span className="text-sm font-semibold max-w-[120px] truncate">{user.fullName || 'Priya'}</span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-red-500 transition duration-200"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <button className="bg-transparent hover:bg-gray-900 text-white border border-white hover:border-pink-500 hover:text-pink-400 px-5 py-2 rounded-full text-sm font-medium transition duration-300">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-pink-500/20 transition duration-300">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex justify-center space-x-8 pb-4">
          <NavLink to="/" className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}>
            About
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}>
            Products
          </NavLink>
          {user && (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}>
              Profile
            </NavLink>
          )}
          {user?.isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? 'text-pink-400 border-b-2 border-pink-400 pb-1 transition duration-200 font-bold bg-pink-900/20 px-3 rounded-md'
                  : 'text-pink-300 hover:text-pink-400 transition duration-200 pb-1 font-semibold px-3 py-1 rounded-md border border-pink-800/50 hover:border-pink-500'
              }
            >
              👑 Admin Portal
            </NavLink>
          )}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-900 transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-semibold ${isActive ? 'bg-pink-900/20 text-pink-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-semibold ${isActive ? 'bg-pink-900/20 text-pink-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}
            >
              About
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-semibold ${isActive ? 'bg-pink-900/20 text-pink-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}
            >
              Products
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-semibold ${isActive ? 'bg-pink-900/20 text-pink-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}
                >
                  Profile ({user.fullName || 'Priya'})
                </NavLink>
                {user.isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-semibold ${isActive ? 'bg-pink-900/20 text-pink-400' : 'text-pink-300 hover:bg-pink-900/20'}`}
                  >
                    👑 Admin Portal
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-semibold text-red-400 hover:bg-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-2 border-t border-gray-900">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-transparent border border-white hover:border-pink-500 py-2 rounded-full text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-pink-600 hover:bg-pink-700 py-2 rounded-full text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
