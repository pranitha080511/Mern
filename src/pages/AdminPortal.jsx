import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/* ─────────────────────────── helpers ─────────────────────────── */
const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  Processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Processing', icon: '⏳', step: 1 },
  Shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: 'Shipped',    icon: '🚚', step: 2 },
  Delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Delivered',  icon: '✅', step: 3 },
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtShort = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatImageUrl = (img) => {
  if (!img) return "https://placehold.co/400x400?text=No+Image";
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }
  const cleanPath = img.startsWith('/') ? img.slice(1) : img;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/${cleanPath}`;
};

/* ─────────────────────── StatusBadge ─────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.Processing;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}55`,
      borderRadius: 20, padding: '4px 12px',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{s.icon} {s.label}</span>
  );
}

/* ─────────────────────── OrderTimeline ─────────────────────── */
function OrderTimeline({ status }) {
  const steps = [
    { key: 'Order Placed', icon: '🛍️', desc: 'Order received' },
    { key: 'Processing',   icon: '⏳', desc: 'Being prepared' },
    { key: 'Shipped',      icon: '🚚', desc: 'Out for delivery' },
    { key: 'Delivered',    icon: '✅', desc: 'Order delivered' },
  ];

  const currentStep = status === 'Processing' ? 1 : status === 'Shipped' ? 2 : 3;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '12px 0' }}>
      {steps.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
              {/* Circle */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done
                  ? active
                    ? 'linear-gradient(135deg, #e8b4b8, #c97a85)'
                    : 'rgba(16,185,129,0.2)'
                  : 'rgba(255,255,255,0.06)',
                border: `2px solid ${done ? (active ? '#e8b4b8' : '#10b981') : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                boxShadow: active ? '0 0 12px rgba(232,180,184,0.4)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? (active ? step.icon : '✓') : step.icon}
              </div>
              {/* Label */}
              <p style={{
                fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 6, textAlign: 'center',
                color: done ? (active ? '#e8b4b8' : '#10b981') : 'rgba(248,244,240,0.3)',
                lineHeight: 1.3,
              }}>{step.key}</p>
              <p style={{ fontSize: 9, color: 'rgba(248,244,240,0.3)', textAlign: 'center', marginTop: 2 }}>{step.desc}</p>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div style={{
                flex: 1, height: 2, marginTop: 17,
                background: i < currentStep
                  ? 'linear-gradient(90deg, #10b981, #3b82f6)'
                  : 'rgba(255,255,255,0.08)',
                borderRadius: 2, transition: 'all 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────── StatCard ─────────────────────── */
function StatCard({ icon, label, value, accent, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '22px 26px',
      display: 'flex', flexDirection: 'column', gap: 6,
      backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 140,
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: accent, opacity: 0.12, filter: 'blur(20px)',
      }} />
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontSize: 24, fontWeight: 700, color: '#f8f4f0', letterSpacing: '-0.5px' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'rgba(248,244,240,0.55)', fontWeight: 500 }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{sub}</span>}
    </div>
  );
}

/* ─────────────────────── OrderDetailModal ─────────────────────── */
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,8,20,0.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20, padding: '32px',
        maxWidth: 580, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          color: '#f8f4f0', borderRadius: '50%', width: 32, height: 32,
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f8f4f0' }}>Order #{order.orderId}</span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, color: 'rgba(248,244,240,0.6)', fontSize: 13 }}>
            <span>📅 {fmtShort(order.createdAt)}</span>
            <span>💰 {fmt(order.totalAmount)}</span>
            {order.user && <>
              <span>👤 {order.user.fullName}</span>
              <span>📧 {order.user.email}</span>
            </>}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Order Journey</p>
          <OrderTimeline status={order.status} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Products</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.products.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px',
              }}>
                <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.style.display = 'none'; }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f8f4f0', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</p>
                  <p style={{ color: 'rgba(248,244,240,0.5)', fontSize: 12 }}>Qty: {p.quantity} × {fmt(p.price)}</p>
                </div>
                <span style={{ color: '#e8b4b8', fontWeight: 700 }}>{fmt(p.price * p.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 16, paddingTop: 16,
          }}>
            <span style={{ color: 'rgba(248,244,240,0.6)', fontSize: 14 }}>Total</span>
            <span style={{ color: '#e8b4b8', fontSize: 18, fontWeight: 700 }}>{fmt(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── UserOrdersModal ─────────────────────── */
function UserOrdersModal({ user, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/admin/users/${user._id}/orders`)
      .then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,8,20,0.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20, padding: '32px',
        maxWidth: 640, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          color: '#f8f4f0', borderRadius: '50%', width: 32, height: 32,
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#1a0f10',
            }}>{user.fullName?.charAt(0).toUpperCase()}</div>
            <div>
              <h3 style={{ color: '#f8f4f0', fontWeight: 700, fontSize: 18, margin: 0 }}>{user.fullName}</h3>
              <p style={{ color: 'rgba(248,244,240,0.5)', fontSize: 13, margin: 0 }}>{user.email}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(248,244,240,0.4)' }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(248,244,240,0.4)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            No orders yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <div key={o._id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                {/* Order row */}
                <div
                  onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', gap: 12 }}
                >
                  <div>
                    <p style={{ color: '#f8f4f0', fontWeight: 700, fontSize: 14, margin: 0 }}>Order #{o.orderId}</p>
                    <p style={{ color: 'rgba(248,244,240,0.5)', fontSize: 12, margin: '2px 0 0' }}>
                      {fmtShort(o.createdAt)} · {o.products.length} item(s)
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusBadge status={o.status} />
                    <span style={{ color: '#e8b4b8', fontWeight: 700, fontSize: 15 }}>{fmt(o.totalAmount)}</span>
                    <span style={{ color: 'rgba(248,244,240,0.4)', fontSize: 12 }}>{expanded === o._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded tracking timeline */}
                {expanded === o._id && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px 18px',
                    background: 'rgba(0,0,0,0.2)',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      Tracking Progress
                    </p>
                    <OrderTimeline status={o.status} />

                    {/* Products list */}
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {o.products.map((p, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px',
                        }}>
                          <img src={p.image} alt={p.name} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.style.display = 'none'; }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#f8f4f0', fontWeight: 600, fontSize: 13, margin: 0 }}>{p.name}</p>
                            <p style={{ color: 'rgba(248,244,240,0.5)', fontSize: 11, margin: 0 }}>Qty {p.quantity} × {fmt(p.price)}</p>
                          </div>
                          <span style={{ color: '#e8b4b8', fontWeight: 700, fontSize: 13 }}>{fmt(p.price * p.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN ADMIN PORTAL ═══════════════════════ */
export default function AdminPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', image: '', category: 'Skincare', inStock: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  const fetchStats = useCallback(async () => {
    try { setStats(await api.get('/api/admin/stats')); } catch (e) { console.error(e); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, status: statusFilter });
      if (search) params.set('search', search);
      const data = await api.get(`/api/admin/orders?${params}`);
      setOrders(data.orders); setTotalPages(data.pages); setTotalOrders(data.total);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, statusFilter, search]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try { setUsers(await api.get('/api/admin/users')); }
    catch (e) { console.error(e); } finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try { setProducts(await api.get('/api/products')); }
    catch (e) { console.error(e); } finally { setProductsLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'products') fetchProducts(); }, [activeTab, fetchProducts]);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', image: '', category: 'Skincare', inStock: true });
    setImageFile(null);
    setImagePreview('');
    setShowProductModal(true);
  };

  const openEditProductModal = (p) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, price: p.price, image: p.image, category: p.category, inStock: p.inStock });
    setImageFile(null);
    setImagePreview(formatImageUrl(p.image));
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('price', productForm.price);
        formData.append('category', productForm.category);
        formData.append('imageFile', imageFile);
        if (editingProduct) {
          formData.append('inStock', productForm.inStock);
          await api.put(`/api/products/${editingProduct.id}`, formData);
        } else {
          await api.post('/api/products', formData);
        }
      } else {
        if (!productForm.image && !editingProduct) {
          alert('Please upload an image file (.jpg or .png format)');
          setSavingProduct(false);
          return;
        }
        if (editingProduct) {
          await api.put(`/api/products/${editingProduct.id}`, productForm);
        } else {
          await api.post('/api/products', productForm);
        }
      }

      if (!editingProduct) {
        alert('🎉 New product launched! Email notification sent to all registered users.');
      }

      setShowProductModal(false);
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  const fetchFeedbacks = useCallback(async () => {
    setFeedbackLoading(true);
    try { setFeedbacks(await api.get('/api/feedback/all')); }
    catch (e) { console.error(e); } finally { setFeedbackLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'feedback') fetchFeedbacks(); }, [activeTab, fetchFeedbacks]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusChange = async (orderId, mongoId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await api.put(`/api/admin/orders/${mongoId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === mongoId ? { ...o, status: updated.status, color: updated.color } : o));
      fetchStats();
    } catch (e) { console.error(e); } finally { setUpdatingId(null); }
  };

  const NAV = [
    { id: 'orders',   icon: '📋', label: 'Orders'     },
    { id: 'products', icon: '🛍️', label: 'Products'   },
    { id: 'users',    icon: '👥', label: 'Customers'  },
    { id: 'feedback', icon: '💬', label: 'Feedback'   },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0d0a1a 0%, #130e22 50%, #0a0812 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#f8f4f0',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Nav Bar ── */}
      <header style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, flexShrink: 0, backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🌸</div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>Hikari Luxe</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(248,244,240,0.4)' }}>Admin Portal</p>
          </div>
        </div>

        {/* Tab Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                background: activeTab === tab.id ? 'rgba(232,180,184,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#e8b4b8' : 'rgba(248,244,240,0.5)',
                borderBottom: activeTab === tab.id ? '2px solid #e8b4b8' : '2px solid transparent',
              }}
            >{tab.icon} {tab.label}</button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>👑 {user?.fullName}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(248,244,240,0.4)' }}>{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: 8,
              padding: '8px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >⏻ Logout</button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, maxWidth: 1300, margin: '0 auto', width: '100%', padding: '32px 24px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard icon="📦" label="Total Orders"  value={stats.totalOrders}       accent="#e8b4b8" sub={`${stats.totalUsers} customers`} />
            <StatCard icon="💰" label="Total Revenue" value={fmt(stats.totalRevenue)}  accent="#c084fc" />
            <StatCard icon="⏳" label="Processing"    value={stats.processing}         accent="#f59e0b" />
            <StatCard icon="🚚" label="Shipped"       value={stats.shipped}            accent="#3b82f6" />
            <StatCard icon="✅" label="Delivered"     value={stats.delivered}          accent="#10b981" />
          </div>
        )}

        {/* ════ ORDERS TAB ════ */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,244,240,0.4)' }}>🔍</span>
                <input
                  id="admin-order-search"
                  type="text"
                  placeholder="Search order ID or customer…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 16px 10px 40px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f8f4f0', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['All', ...STATUS_OPTIONS].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                    fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
                    border: `1px solid ${statusFilter === s ? '#e8b4b8' : 'rgba(255,255,255,0.12)'}`,
                    background: statusFilter === s ? 'rgba(232,180,184,0.15)' : 'transparent',
                    color: statusFilter === s ? '#e8b4b8' : 'rgba(248,244,240,0.6)',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '88px 1fr 160px 110px 130px 130px 100px',
                padding: '13px 20px',
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,244,240,0.35)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(248,244,240,0.35)' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div> Loading orders…
                </div>
              ) : orders.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(248,244,240,0.35)' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div> No orders found
                </div>
              ) : orders.map((order, i) => (
                <div key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    display: 'grid', gridTemplateColumns: '88px 1fr 160px 110px 130px 130px 100px',
                    padding: '15px 20px',
                    borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#e8b4b8', fontWeight: 700, fontSize: 13 }}>#{order.orderId}</span>
                  <div>
                    <p style={{ margin: 0, color: '#f8f4f0', fontWeight: 600, fontSize: 13 }}>{order.user?.fullName || 'Unknown'}</p>
                    <p style={{ margin: 0, color: 'rgba(248,244,240,0.4)', fontSize: 11 }}>{order.user?.email || ''}</p>
                  </div>
                  <span style={{ color: 'rgba(248,244,240,0.6)', fontSize: 12 }}>
                    {order.products.slice(0, 2).map(p => p.name).join(', ')}
                    {order.products.length > 2 && ` +${order.products.length - 2}`}
                  </span>
                  <span style={{ color: '#f8f4f0', fontWeight: 700, fontSize: 13 }}>{fmt(order.totalAmount)}</span>
                  <StatusBadge status={order.status} />
                  <span style={{ color: 'rgba(248,244,240,0.5)', fontSize: 12 }}>{fmtShort(order.createdAt)}</span>
                  <div onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={updatingId === order.orderId}
                      onChange={e => handleStatusChange(order.orderId, order._id, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 8, color: '#f8f4f0',
                        padding: '6px 8px', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', outline: 'none', width: '100%',
                        opacity: updatingId === order.orderId ? 0.5 : 1,
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} style={{ background: '#1a1525' }}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, color: 'rgba(248,244,240,0.5)', fontSize: 13 }}>
                <span>Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalOrders)} of {totalOrders}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                    padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent', color: page === 1 ? 'rgba(248,244,240,0.25)' : '#f8f4f0',
                    cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: 13,
                  }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      padding: '7px 13px', borderRadius: 8,
                      border: `1px solid ${page === p ? '#e8b4b8' : 'rgba(255,255,255,0.12)'}`,
                      background: page === p ? 'rgba(232,180,184,0.2)' : 'transparent',
                      color: page === p ? '#e8b4b8' : '#f8f4f0',
                      cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    }}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                    padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent', color: page === totalPages ? 'rgba(248,244,240,0.25)' : '#f8f4f0',
                    cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontSize: 13,
                  }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ PRODUCTS TAB ════ */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button onClick={openAddProductModal} style={{
                background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
                color: '#1a0f10', border: 'none', padding: '10px 20px', borderRadius: 8,
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>+ Add Product</button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 100px 100px',
                background: 'rgba(0,0,0,0.2)', padding: '14px 24px',
                fontSize: 12, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span>Image</span>
                <span>Name</span>
                <span>Category</span>
                <span>Price</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {productsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(248,244,240,0.4)' }}>Loading products…</div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(248,244,240,0.4)' }}>No products found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {products.map((p, i) => (
                    <div key={p.id} style={{
                      display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 100px 100px',
                      padding: '16px 24px', alignItems: 'center',
                      borderBottom: i !== products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <img src={formatImageUrl(p.image)} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/400x400?text=No+Image"; }} />
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(248,244,240,0.6)' }}>{p.category}</div>
                      <div style={{ fontWeight: 700, color: '#e8b4b8' }}>₹{p.price}</div>
                      <div>
                        {p.inStock ? (
                          <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>In Stock</span>
                        ) : (
                          <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Out of Stock</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEditProductModal(p)} style={{
                          background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
                          padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}>Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{
                          background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                          padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ CUSTOMERS TAB ════ */}
        {activeTab === 'users' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 90px 110px 120px 80px',
              padding: '13px 24px',
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              {['Customer', 'Email', 'Gender', 'Orders', 'Total Spent', 'Role'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,244,240,0.35)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
              ))}
            </div>

            {usersLoading ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(248,244,240,0.35)' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div> Loading customers…
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(248,244,240,0.35)' }}>No customers found.</div>
            ) : users.map((u, i) => (
              <div key={u._id}
                onClick={() => setSelectedUser(u)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 180px 90px 110px 120px 80px',
                  padding: '15px 24px',
                  borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#1a0f10', flexShrink: 0,
                  }}>{u.fullName?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#f8f4f0', fontSize: 13 }}>{u.fullName}</p>
                    <p style={{ margin: 0, color: 'rgba(248,244,240,0.4)', fontSize: 11 }}>Joined {fmtShort(u.createdAt)}</p>
                  </div>
                </div>
                <span style={{ color: 'rgba(248,244,240,0.6)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                <span style={{ color: 'rgba(248,244,240,0.6)', fontSize: 13, textTransform: 'capitalize' }}>{u.gender || '—'}</span>
                <span style={{ color: '#f8f4f0', fontWeight: 700 }}>{u.orderCount}</span>
                <span style={{ color: '#e8b4b8', fontWeight: 700, fontSize: 13 }}>{fmt(u.totalSpent)}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: u.isAdmin ? 'rgba(192,132,252,0.15)' : 'rgba(248,244,240,0.06)',
                  color: u.isAdmin ? '#c084fc' : 'rgba(248,244,240,0.45)',
                  border: `1px solid ${u.isAdmin ? '#c084fc55' : 'rgba(255,255,255,0.1)'}`,
                }}>{u.isAdmin ? '👑 Admin' : 'User'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ════ FEEDBACK TAB ════ */}
        {activeTab === 'feedback' && (
          <div>
            {feedbackLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(248,244,240,0.35)' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div> Loading feedback…
              </div>
            ) : feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(248,244,240,0.35)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>No feedback yet</p>
                <p style={{ fontSize: 13, color: 'rgba(248,244,240,0.25)' }}>Feedback will appear here when customers review delivered orders.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {feedbacks.map(fb => (
                  <div key={fb._id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}>
                    {/* Photo */}
                    {fb.photo && (
                      <div
                        onClick={() => setExpandedPhoto(`http://localhost:5000${fb.photo}`)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        <img
                          src={`http://localhost:5000${fb.photo}`}
                          alt="Product feedback"
                          style={{ width: '100%', height: 180, objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 8, right: 8,
                          background: 'rgba(0,0,0,0.6)', borderRadius: 8,
                          padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600,
                        }}>📷 Click to enlarge</div>
                      </div>
                    )}

                    <div style={{ padding: '18px 20px' }}>
                      {/* User info + rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: '#1a0f10', flexShrink: 0,
                          }}>{fb.user?.fullName?.charAt(0).toUpperCase() || '?'}</div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#f8f4f0', fontSize: 14 }}>{fb.user?.fullName || 'Unknown'}</p>
                            <p style={{ margin: 0, color: 'rgba(248,244,240,0.4)', fontSize: 11 }}>{fb.user?.email || ''}</p>
                          </div>
                        </div>
                        <span style={{
                          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                          color: '#f59e0b', borderRadius: 20, padding: '3px 10px',
                          fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                        }}>
                          {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                        </span>
                      </div>

                      {/* Order badge */}
                      <div style={{
                        display: 'inline-block', marginBottom: 12,
                        background: 'rgba(232,180,184,0.1)', border: '1px solid rgba(232,180,184,0.2)',
                        borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#e8b4b8',
                      }}>
                        📦 Order #{fb.orderId}
                      </div>

                      {/* Comment */}
                      <p style={{
                        margin: 0, fontSize: 13, lineHeight: 1.6,
                        color: 'rgba(248,244,240,0.75)',
                      }}>"{fb.comment}"</p>

                      {/* Date */}
                      <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(248,244,240,0.3)' }}>
                        📅 {fmtShort(fb.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {selectedUser  && <UserOrdersModal  user={selectedUser}  onClose={() => setSelectedUser(null)} />}

      {/* Photo expand modal */}
      {expandedPhoto && (
        <div onClick={() => setExpandedPhoto(null)} style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,8,20,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'pointer',
        }}>
          <img src={expandedPhoto} alt="Feedback" style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: 16, objectFit: 'contain' }} />
        </div>
      )}

      {/* ════ PRODUCT MODAL (ADD / EDIT) ════ */}
      {showProductModal && (
        <div onClick={() => setShowProductModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,8,20,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '32px',
            maxWidth: 500, width: '100%', position: 'relative',
          }}>
            <button onClick={() => setShowProductModal(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: '#f8f4f0', borderRadius: '50%', width: 32, height: 32,
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(248,244,240,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Name</label>
                <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#f8f4f0', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }} placeholder="Product Name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(248,244,240,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Category</label>
                  <select required value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f8f4f0', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}>
                    <option value="Skincare" style={{ color: '#000' }}>Skincare</option>
                    <option value="Makeup" style={{ color: '#000' }}>Makeup</option>
                    <option value="Fragrance" style={{ color: '#000' }}>Fragrance</option>
                    <option value="Nail Care" style={{ color: '#000' }}>Nail Care</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(248,244,240,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Price (₹)</label>
                  <input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f8f4f0', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }} placeholder="Price" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(248,244,240,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Upload Image (.jpg, .png, .webp)</label>
                <div style={{
                  border: '2px dashed rgba(232,180,184,0.35)',
                  borderRadius: 14, padding: '18px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)', position: 'relative',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{
                      position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', zIndex: 10
                    }}
                  />
                  
                  {imagePreview || productForm.image ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <img
                        src={imagePreview || formatImageUrl(productForm.image)}
                        alt="Product preview"
                        style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(232,180,184,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/400x400?text=No+Image"; }}
                      />
                      <div style={{ fontSize: 12, color: '#e8b4b8', fontWeight: 600 }}>
                        {imageFile ? `📁 ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)` : 'Current Image'}
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(248,244,240,0.4)' }}>Click or drag a new image file (.jpg, .png) to change</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f8f4f0' }}>Click or Drag Image File Here</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(248,244,240,0.4)' }}>Select JPG, PNG or WEBP image format</p>
                    </div>
                  )}
                </div>
                
                {/* Fallback image path input */}
                <div style={{ marginTop: 10 }}>
                  <details style={{ fontSize: 11, color: 'rgba(248,244,240,0.5)' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: 6 }}>Or specify direct image path / URL</summary>
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={e => {
                        setProductForm({ ...productForm, image: e.target.value });
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                      style={{
                        width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, color: '#f8f4f0', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginTop: 4
                      }}
                      placeholder="images/lipstick.jpg or https://..."
                    />
                  </details>
                </div>
              </div>
              
              {editingProduct && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <input type="checkbox" id="inStockCheck" checked={productForm.inStock} onChange={e => setProductForm({ ...productForm, inStock: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <label htmlFor="inStockCheck" style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>Product is In Stock</label>
                </div>
              )}

              <button
                type="submit"
                disabled={savingProduct}
                style={{
                  marginTop: 16, background: 'linear-gradient(135deg, #e8b4b8, #c97a85)',
                  color: '#1a0f10', border: 'none', padding: '14px', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, cursor: savingProduct ? 'default' : 'pointer',
                  opacity: savingProduct ? 0.7 : 1, transition: 'transform 0.2s',
                }}
              >
                {savingProduct ? 'Saving Product & Sending Email…' : (editingProduct ? 'Update Product' : '🚀 Launch New Product')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
