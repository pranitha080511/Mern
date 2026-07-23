import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Check, Heart } from 'lucide-react';
import api from '../services/api';

export default function Products({ addToCart, user, token }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wishlist: set of product numeric IDs that are wishlisted
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);

  // Tooltip for guests
  const [showLoginHint, setShowLoginHint] = useState(null);

  // Read passed category state from routing navigation
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/api/products');
        setProductsList(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch wishlist for logged-in users
  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get('/api/wishlist');
      // data is array of populated Product docs; each has numeric `id`
      setWishlistIds(new Set(data.map(p => p.id)));
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  }, [token]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const categories = ['All', 'Makeup', 'Skincare', 'Fragrance', 'Nail Care'];

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();

    if (!token) {
      // Show hint near the button
      setShowLoginHint(product.id);
      setTimeout(() => setShowLoginHint(null), 2200);
      return;
    }

    setTogglingId(product.id);
    try {
      const updatedList = await api.post('/api/wishlist/toggle', { productId: product.id });
      setWishlistIds(new Set(updatedList.map(p => p.id)));
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setTogglingId(null);
    }
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-pink-100/50">
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
            >{cat}</button>
          ))}
        </div>
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

      {/* Wishlist count banner for logged-in users */}
      {token && wishlistIds.size > 0 && (
        <div className="flex items-center gap-3 bg-pink-50 border border-pink-200 text-pink-700 px-5 py-3 rounded-2xl text-sm font-semibold">
          <Heart size={16} fill="currentColor" className="text-pink-500" />
          <span>You have <strong>{wishlistIds.size}</strong> item{wishlistIds.size !== 1 ? 's' : ''} in your wishlist</span>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 shadow-sm">
          <p className="text-lg text-gray-500 font-medium">No products found matching your criteria.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-700 transition"
          >Reset Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const isJustAdded  = addedProductId === product.id;
            const isWishlisted = wishlistIds.has(product.id);
            const isToggling   = togglingId === product.id;
            const hintVisible  = showLoginHint === product.id;

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
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xxs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-pink-600 font-extrabold text-lg mt-1">₹{product.price}</p>

                  {/* Bottom Buttons — Cart + Wishlist always visible side by side */}
                  <div className="mt-auto pt-4 border-t border-pink-50 flex items-center gap-2">

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isJustAdded}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold shadow-md transition duration-200 ${
                        isJustAdded
                          ? 'bg-green-600 text-white shadow-green-600/20'
                          : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/10'
                      }`}
                    >
                      {isJustAdded ? (
                        <><Check size={15} /><span>Added!</span></>
                      ) : (
                        <><ShoppingCart size={15} /><span>Add to Cart</span></>
                      )}
                    </button>

                    {/* Wishlist Heart button */}
                    <div className="relative">
                      <button
                        id={`wishlist-bottom-btn-${product.id}`}
                        onClick={(e) => handleToggleWishlist(e, product)}
                        disabled={isToggling}
                        title={
                          !token
                            ? 'Login to wishlist'
                            : isWishlisted
                            ? 'Remove from wishlist'
                            : 'Save to wishlist'
                        }
                        className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                          isToggling ? 'opacity-60' : 'hover:scale-105 active:scale-95'
                        } ${
                          isWishlisted
                            ? 'bg-pink-50 border-pink-400'
                            : 'bg-white border-gray-200 hover:border-pink-400 hover:bg-pink-50'
                        }`}
                      >
                        <Heart
                          size={18}
                          className={`transition-all duration-200 ${isToggling ? 'animate-pulse' : ''}`}
                          color={isWishlisted ? '#ec4899' : '#9ca3af'}
                          fill={isWishlisted ? '#ec4899' : 'none'}
                        />
                      </button>

                      {/* Guest tooltip */}
                      {hintVisible && (
                        <div className="absolute bottom-14 right-0 w-36 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg z-20 text-center leading-snug">
                          <span
                            onClick={() => navigate('/login')}
                            className="text-pink-400 cursor-pointer hover:underline font-semibold"
                          >Login</span> to save to wishlist
                          <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-gray-900 rotate-45" />
                        </div>
                      )}
                    </div>
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
