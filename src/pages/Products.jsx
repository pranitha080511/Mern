import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Check } from 'lucide-react';

export default function Products({ addToCart }) {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  // Read passed category state from routing navigation (Home page category cards)
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const categories = ['All', 'Makeup', 'Skincare', 'Fragrance', 'Nail Care'];

  const productsList = [
    { id: 1, name: 'Matte Lipstick', price: 799, image: 'images/lipstick.jpg', category: 'Makeup' },
    { id: 2, name: 'Vitamin C Serum', price: 999, image: 'images/serum.jpg', category: 'Skincare' },
    { id: 3, name: 'Face Cream', price: 699, image: 'images/moisturizer.jpg', category: 'Skincare' },
    { id: 4, name: 'Luxury Perfume', price: 1999, image: 'images/perfume.jpg', category: 'Fragrance' },
    { id: 5, name: 'Nail Polish', price: 499, image: 'images/nail.jpg', category: 'Nail Care' },
    { id: 6, name: 'Foundation', price: 1099, image: 'images/foundation.jpg', category: 'Makeup' },
    { id: 7, name: 'Waterproof Eyeliner', price: 399, image: 'images/eyeliner.jpg', category: 'Makeup' },
    { id: 8, name: 'Face Wash', price: 599, image: 'images/facewash.jpg', category: 'Skincare' },
    { id: 9, name: 'Sunscreen SPF 50', price: 899, image: 'images/sunscreen.jpg', category: 'Skincare' },
    { id: 10, name: 'Blush Palette', price: 749, image: 'images/blush.jpg', category: 'Makeup' },
    { id: 11, name: 'Compact Powder', price: 699, image: 'images/compact.jpg', category: 'Makeup' },
    { id: 12, name: 'Face Cleanser', price: 649, image: 'images/cleanser.jpg', category: 'Skincare' },
  ];

  // Filtering Logic
  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 font-serif">
          Our Products
        </h2>
        <div className="h-1 w-20 bg-pink-500 mx-auto mt-4 rounded-full" />
        <p className="text-gray-500 text-sm mt-3">Discover premium cosmetic items created with pure care.</p>
      </div>

      {/* Filters and Search Bar Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-pink-100/50">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition duration-200 focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                  : 'bg-pink-50/50 text-gray-700 hover:bg-pink-50 border border-pink-100/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 order-1 md:order-2">
          <input
            type="text"
            placeholder="Search cosmetics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white text-sm transition"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 shadow-sm">
          <p className="text-lg text-gray-500 font-medium">No products found matching your criteria.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const isJustAdded = addedProductId === product.id;
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-pink-100/30 overflow-hidden flex flex-col h-full transition duration-300"
              >
                {/* Image */}
                <div className="relative h-60 w-full bg-pink-50/30 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xxs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-extrabold text-lg mt-2">
                    ₹{product.price}
                  </p>

                  <div className="mt-5 pt-4 border-t border-pink-50 flex items-end justify-center">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isJustAdded}
                      className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition duration-200 ${
                        isJustAdded
                          ? 'bg-green-600 text-white shadow-green-600/20'
                          : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/10'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check size={16} />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
