import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

 const API_URL = import.meta.env.VITE_API_URL;

const categories = [
  {
    name: 'Makeup',
    image: `${API_URL}/images/lipstick.jpg`,
    desc: 'Lipsticks, Foundations, Eyeliners, Mascara and more.',
    filter: 'Makeup'
  },
  {
    name: 'Skincare',
    image: `${API_URL}/images/skincare.jpg`,
    desc: 'Face Wash, Serum, Moisturizer, Sunscreen and Toners.',
    filter: 'Skincare'
  },
  {
    name: 'Fragrances',
    image: `${API_URL}/images/perfume.jpg`,
    desc: 'Luxury perfumes and body mists for every occasion.',
    filter: 'Fragrance'
  },
  {
    name: 'Nail Care',
    image: `${API_URL}/images/nail.jpg`,
    desc: 'Nail polish, nail art kits and manicure essentials.',
    filter: 'Nail Care'
  }
];

  const handleCategoryClick = (filter) => {
    navigate('/products', { state: { category: filter } });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '' });
        setSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-pink-500 to-purple-600 text-white py-24 sm:py-32 px-4 shadow-inner">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.6),transparent_40%)]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <span className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border border-white/20">
            <Sparkles size={14} className="text-pink-200" />
            <span>New Collection Live</span>
          </span>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-md font-serif leading-tight">
            Enhance Your <br className="sm:hidden" />
            <span className="text-pink-100">Natural Beauty</span>
          </h2>

          <p className="text-base sm:text-xl text-pink-50 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            Discover premium skincare, makeup, fragrances, and beauty essentials designed to make you glow every single day. Crafted with natural ingredients and cruelty-free innovation.
          </p>

          <div className="pt-4">
            <button
              onClick={() => navigate('/products')}
              className="group inline-flex items-center space-x-2 bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-black/25 transform hover:-translate-y-0.5 transition duration-200"
            >
              <span>Shop Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Our Categories
          </h2>
          <div className="h-1 w-20 bg-pink-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 text-sm mt-3">Browse our premium lines tailored to highlight your unique features.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(cat.filter)}
              className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-pink-100/30 overflow-hidden transform hover:-translate-y-1 transition duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-4">
                  <span className="text-white text-xs font-semibold tracking-wider uppercase bg-pink-600/90 px-4 py-1.5 rounded-full">
                    View Items
                  </span>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition duration-200">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe/Community Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 py-20 px-4 shadow-md">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_30%,transparent_70%)]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Join Our Beauty Community
          </h2>
          <p className="text-pink-50 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Subscribe to receive premium beauty tips, exclusive product launches, and special discount offers.
          </p>

          <div className="max-w-md mx-auto mt-8">
            {submitted ? (
              <div className="bg-white/90 backdrop-blur-sm border-2 border-pink-400 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center space-y-3 animate-fade-in">
                <CheckCircle size={48} className="text-green-500" />
                <h3 className="text-xl font-bold text-gray-900">Thank You, {formData.name}!</h3>
                <p className="text-gray-600 text-sm">
                  You have successfully subscribed. Check <strong>{formData.email}</strong> for your 15% welcome code!
                </p>
              </div>
            ) : (
              <form 
                onSubmit={handleSubscribe} 
                className="bg-white border border-pink-100 rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 text-left"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="newsletter-name">
                    Name
                  </label>
                  <input
                    id="newsletter-name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="newsletter-email">
                    Email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white text-sm transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-pink-600/30 transition duration-200"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
