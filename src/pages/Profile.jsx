import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Heart, ShoppingCart, Key, LogOut, CheckCircle, Edit, Trash2, MapPin as TrackIcon } from 'lucide-react';
import api from '../services/api';
import OrderTracker from '../components/OrderTracker';
import FeedbackForm from '../components/FeedbackForm';

export default function Profile({ user, setUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: 'Female',
    address: '',
    skinType: 'Combination'
  });

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState(null);

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());

  // Wishlist list state
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const [supportOpen, setSupportOpen] = useState(false);

  // Sync user data to edit form
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || 'Female',
        address: user.address || '',
        skinType: user.skinType || 'Combination'
      });
    }
  }, [user]);

  // Fetch orders and wishlist on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get('/api/orders/my-orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchWishlist = async () => {
      try {
        const data = await api.get('/api/wishlist');
        setWishlist(data);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchOrders();
    fetchWishlist();
  }, []);

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put('/api/auth/profile', editForm);
      setUser(data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      const data = await api.put('/api/auth/change-password', {
        current: pwForm.current,
        new: pwForm.new
      });
      setPwMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPwForm({ current: '', new: '', confirm: '' });
        setPwMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPwMessage({ type: 'error', text: err.message || 'Failed to update password' });
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      const updatedWishlist = await api.post('/api/wishlist/toggle', { productId: id });
      setWishlist(updatedWishlist);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <>
    <div className="space-y-12 pb-16">
      
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 py-16 text-white text-center shadow-inner relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,30%,transparent_70%)]" />
        <div className="relative space-y-3 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
            Welcome Back, {user?.fullName || 'Priya Sharma'}
          </h2>
          <p className="text-pink-100 max-w-xl mx-auto text-sm sm:text-base">
            Manage your account details, track order progress, and customize your skincare preferences.
          </p>
        </div>
      </section>

      {/* Main Profile Info Section */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-pink-50">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4">
            My Profile
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Skin Type</label>
                <select
                  value={editForm.skinType}
                  onChange={(e) => setEditForm({ ...editForm, skinType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                >
                  <option value="Dry">Dry</option>
                  <option value="Oily">Oily</option>
                  <option value="Combination">Combination</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditForm({
                    fullName: user?.fullName || 'Priya Sharma',
                    phone: user?.phone || '+91 98765 43210',
                    dob: user?.dob || '2002-08-15',
                    gender: user?.gender || 'Female',
                    address: user?.address || '24, Anna Nagar, Madurai, Tamil Nadu - 625020',
                    skinType: user?.skinType || 'Combination'
                  });
                  setIsEditing(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 text-base">
            <div className="flex items-center space-x-3">
              <User className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Name</span>
                <span className="font-semibold text-gray-800">{user?.fullName || 'Priya Sharma'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Email</span>
                <span className="font-semibold text-gray-800">{user?.email || 'priyasharma@gmail.com'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Phone</span>
                <span className="font-semibold text-gray-800">{editForm.phone}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Gender</span>
                <span className="font-semibold text-gray-800">{editForm.gender}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Date of Birth</span>
                <span className="font-semibold text-gray-800">{editForm.dob}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-pink-500 shrink-0" size={20} />
              <div>
                <span className="block text-xs text-gray-400 uppercase font-bold">Address</span>
                <span className="font-semibold text-gray-800">{editForm.address}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Beauty Preferences */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4 mb-8">
          Beauty Preferences
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100/30">
            <h3 className="font-bold text-pink-600 text-sm uppercase tracking-wide">Skin Type</h3>
            <p className="mt-2 font-semibold text-gray-800">{editForm.skinType}</p>
          </div>
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100/30">
            <h3 className="font-bold text-pink-600 text-sm uppercase tracking-wide">Favorite Line</h3>
            <p className="mt-2 font-semibold text-gray-800">Skincare</p>
          </div>
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100/30">
            <h3 className="font-bold text-pink-600 text-sm uppercase tracking-wide">Favorite Item</h3>
            <p className="mt-2 font-semibold text-gray-800">C Serum</p>
          </div>
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100/30">
            <h3 className="font-bold text-pink-600 text-sm uppercase tracking-wide">Brand</h3>
            <p className="mt-2 font-semibold text-gray-800">Hikari's Luxe</p>
          </div>
        </div>
      </section>

      {/* Order History */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4 mb-8">
          Order History
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-150">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-black text-white text-sm">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loadingOrders ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId || order._id} className="hover:bg-pink-50/20 transition">
                    <td className="p-4 text-gray-500 font-mono">#{order.orderId}</td>
                    <td className="p-4 text-gray-800 font-semibold">
                      <div className="max-w-xs sm:max-w-md truncate mx-auto" title={order.products.map((p) => `${p.name} (x${p.quantity})`).join(', ')}>
                        {order.products.map((p) => `${p.name} (x${p.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-pink-600 font-bold">₹{order.totalAmount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${order.color}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => setTrackedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-pink-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          🚚 Track
                        </button>
                        {order.status === 'Delivered' && (
                          feedbackSubmitted.has(order._id) ? (
                            <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-200">
                              ✅ Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => setFeedbackOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              ⭐ Feedback
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Wishlist */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4 mb-8">
          Wishlist
        </h2>
        {loadingWishlist ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          </div>
        ) : wishlist.length === 0 ? (
          <p className="text-center py-6 text-gray-500">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <div 
                key={item.id || item._id} 
                className="flex items-center justify-between p-4 bg-pink-50/20 rounded-2xl border border-pink-100/30"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="text-pink-500 shrink-0" fill="currentColor" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                    <span className="text-xs text-gray-400">₹{item.price}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveWishlist(item.id || item._id)}
                  className="text-gray-400 hover:text-red-500 p-2 transition"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Account Settings Forms/Actions */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4 inline-block mb-10">
          Account Settings
        </h2>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordChange} className="max-w-md mx-auto text-left space-y-4 border border-pink-100 rounded-2xl p-6 bg-pink-50/10">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Key size={18} className="text-pink-500" />
              <span>Change Password</span>
            </h3>
            {pwMessage && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${pwMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {pwMessage.text}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Current Password</label>
              <input
                type="password"
                required
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">New Password</label>
              <input
                type="password"
                required
                value={pwForm.new}
                onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>
            <div className="flex space-x-3 pt-2 justify-end text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPwForm({ current: '', new: '', confirm: '' });
                  setPwMessage(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition"
              >
                Update
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-semibold transition duration-300 shadow-md shadow-pink-600/10 hover:shadow-pink-600/20"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition duration-300 shadow-md"
            >
              Change Password
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition duration-300 shadow-md flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </section>

      {/* Need Help? Accordion */}
      <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-pink-100/50 p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-4 mb-6">
          Need Help?
        </h2>
        <div className={`border rounded-2xl transition-all duration-300 ${supportOpen ? 'border-pink-300 bg-pink-50/10' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-gray-800 text-base focus:outline-none hover:text-pink-600 transition"
          >
            <span>Customer Support Contact</span>
            <span className={`text-pink-500 text-xl transition-transform duration-200 ${supportOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {supportOpen && (
            <div className="px-6 pb-6 pt-2 border-t border-pink-50 text-sm sm:text-base space-y-3 text-gray-600 leading-relaxed">
              <p><strong>Email :</strong> support@hikarisluxe.com</p>
              <p><strong>Phone :</strong> +91 98765 43210</p>
              <p>Our customer support team is available Monday to Saturday, from 9:00 AM to 7:00 PM.</p>
            </div>
          )}
        </div>
      </section>

    </div>

    {/* Order Tracker Modal */}
    {trackedOrder && (
      <OrderTracker
        order={trackedOrder}
        onClose={() => setTrackedOrder(null)}
      />
    )}

    {/* Feedback Form Modal */}
    {feedbackOrder && (
      <FeedbackForm
        order={feedbackOrder}
        onClose={() => setFeedbackOrder(null)}
        onSubmitted={() => {
          setFeedbackSubmitted(prev => new Set([...prev, feedbackOrder._id]));
        }}
      />
    )}
    </>
  );
}

