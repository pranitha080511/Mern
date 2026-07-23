import React, { useState } from 'react';
import { Play, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function About() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const accordions = [
    {
      title: 'Our Story',
      content: "Hikari's Luxe was founded with a clear vision: to provide safe, high-quality, and scientifically-proven beauty products for every skin type. Combining traditional botanicals with modern skincare innovations, we formulate products that enhance and maintain your skin's natural glow."
    },
    {
      title: 'Our Mission',
      content: 'To inspire confidence and self-love by offering premium cosmetics and beauty solutions made with organic, clean, and cruelty-free ingredients that nurture your skin while preserving the environment.'
    },
    {
      title: 'Our Vision',
      content: "To become a globally trusted leader in ethical cosmetics, renowned for sustainable practices, clinical-grade efficacy, and an uncompromising commitment to celebrating diversity in beauty."
    }
  ];

  const highlights = [
    'Premium Quality Products with Dermatologist-tested Formulations',
    '100% Cruelty-Free and Sustainably Sourced Botanicals',
    'Tailored Solutions for Dry, Oily, Combination, and Sensitive Skin',
    'Luxurious Fragrances Crafted by Master Perfumers',
    'Loved and Trusted by Over 50,000+ Satisfied Customers Worldwide'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* About Us Title Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-4xl font-extrabold text-pink-700 font-serif tracking-tight">
          About Us
        </h2>
        <div className="h-1 w-20 bg-pink-500 mx-auto rounded-full" />
        <p className="text-lg leading-relaxed text-gray-700 pt-3">
          At <strong className="text-gray-900">Hikari's Luxe</strong>, we believe beauty is more than skin deep—it is an expression of confidence, health, and individuality. We curate clean skincare, radiant makeup, and mesmerizing perfumes to elevate your everyday routines.
        </p>
      </section>

      {/* Main Image Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-pink-500/10 rounded-2xl blur-xl group-hover:bg-pink-500/15 transition duration-300" />
          <img 
            src={`${API_URL}/images/about.jpg`} 
            alt="About Hikari's Luxe" 
            className="relative w-full h-[380px] object-cover rounded-2xl shadow-xl border border-pink-100"
          />
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Sparkles className="text-pink-500" />
            <span>Redefining Clean Beauty</span>
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Every product in our collection undergoes rigorous research and evaluation. We extract premium plant actives and vitamins to deliver noticeable, long-lasting skincare results without using harmful parabens, sulfates, or chemical fillers.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether you are building your first skincare routine or looking for the perfect signature fragrance, Hikari's Luxe offers products built on values of sustainability, absolute quality, and customer obsession.
          </p>
        </div>
      </section>

      {/* Brand Values Accordion */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-pink-100/50 space-y-4">
        <h3 className="text-2xl font-extrabold text-pink-700 text-center mb-8 font-serif">
          Our Brand Values
        </h3>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          {accordions.map((acc, idx) => {
            const isOpened = activeAccordion === idx;
            return (
              <div 
                key={idx} 
                className={`border rounded-2xl transition-all duration-300 ${isOpened ? 'border-pink-300 bg-pink-50/20' : 'border-gray-200 bg-white'}`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-gray-800 text-lg focus:outline-none"
                >
                  <span>{acc.title}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-pink-500 transition-transform duration-300 ${isOpened ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${isOpened ? 'max-h-48 border-t border-pink-100' : 'max-h-0'}`}
                >
                  <p className="px-6 py-5 text-gray-600 leading-relaxed text-sm sm:text-base">
                    {acc.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brand Video Section */}
      <section className="text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-pink-700 font-serif">
          Watch Our Brand Video
        </h3>
        <div className="max-w-4xl mx-auto relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video">
          <video 
            className="w-full h-full object-cover" 
            controls 
            preload="metadata"
            poster={`${API_URL}/images/cosmetics-bg.jpg`}
          >
            <source src={`${API_URL}/videos/brand.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Why Customers Love Us (Highlights) */}
      <section className="bg-pink-50/50 rounded-3xl p-6 sm:p-10 border border-pink-100 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
            Why Customers Love Us
          </h3>
          <ul className="space-y-4">
            {highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-gray-700">
                <CheckCircle2 className="text-pink-500 shrink-0 mt-1" size={20} />
                <span className="text-base leading-relaxed">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-80 h-80 shrink-0 overflow-hidden rounded-2xl shadow-lg border border-pink-100">
          <img 
            src={`${API_URL}/images/cosmetics-bg.jpg`} 
            alt="Hikari Cosmetics Selection" 
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-pink-700 font-serif">
          Contact Us
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-md hover:shadow-lg transition">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Email</h4>
            <p className="text-pink-600 font-medium break-all">support@hikarisluxe.com</p>
            <p className="text-xs text-gray-400 mt-2">Available for support 24/7</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-md hover:shadow-lg transition">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Phone</h4>
            <p className="text-pink-600 font-medium">+91 98765 43210</p>
            <p className="text-xs text-gray-400 mt-2">Mon - Sat: 9 AM - 7 PM</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-md hover:shadow-lg transition">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Location</h4>
            <p className="text-pink-600 font-medium">Madurai, Tamil Nadu, India</p>
            <p className="text-xs text-gray-400 mt-2">Corporate Headquarters</p>
          </div>
        </div>
      </section>

    </div>
  );
}
