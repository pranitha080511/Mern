import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-auto border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif text-pink-400">
              Hikari's Luxe
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
              Your ultimate destination for premium cosmetics, advanced skincare, and luxury fragrances. Inspire your natural glow every day.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-200">
              Quick Links
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-pink-400 transition duration-200">Home</Link>
              <Link to="/about" className="hover:text-pink-400 transition duration-200">About Us</Link>
              <Link to="/products" className="hover:text-pink-400 transition duration-200">Our Products</Link>
              <Link to="/profile" className="hover:text-pink-400 transition duration-200">My Profile</Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-200">
              Contact Us
            </h4>
            <div className="flex flex-col items-center md:items-start space-y-3 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <Mail size={16} className="text-pink-400" />
                <span>support@hikarisluxe.com</span>
              </span>
              <span className="flex items-center space-x-2">
                <Phone size={16} className="text-pink-400" />
                <span>+91 98765 43210</span>
              </span>
              <span className="flex items-center space-x-2">
                <MapPin size={16} className="text-pink-400" />
                <span>Madurai, Tamil Nadu, India</span>
              </span>
            </div>
          </div>

        </div>

        <hr className="border-gray-800 my-8 w-full" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 space-y-4 sm:space-y-0">
          <p>© 2026 Hikari's Luxe. All Rights Reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-pink-400 transition text-xs">Terms of Service</a>
            <a href="#" className="hover:text-pink-400 transition text-xs">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
