import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, RefreshCw, AlertCircle, X, ShieldCheck } from 'lucide-react';
import api from '../services/api';

/* ── Admin Login Modal ── */
function AdminLoginModal({ onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!adminEmail.trim()) { setError('Email is required.'); return; }
    if (!adminPassword.trim()) { setError('Password is required.'); return; }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', {
        email: adminEmail.trim(),
        password: adminPassword.trim()
      });
      if (!data.isAdmin) {
        setError('This account does not have admin privileges.');
        return;
      }
      onLoginSuccess(data);
      onClose();
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
          >
            <ShieldCheck size={28} color="white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Admin Sign In</h3>
          <p className="text-xs mt-1" style={{ color: 'rgba(248,244,240,0.45)' }}>
            Enter your admin credentials to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(248,244,240,0.6)' }}>
              Admin Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,244,240,0.35)' }} />
              <input
                id="admin-modal-email"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8f4f0',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(248,244,240,0.6)' }}>
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,244,240,0.35)' }} />
              <input
                id="admin-modal-password"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8f4f0',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #db2777)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            <ShieldCheck size={16} />
            {loading ? 'Verifying…' : 'Access Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Main Login Page ── */
export default function Login({ user, onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  if (user) {
    return user.isAdmin
      ? <Navigate to="/admin" replace />
      : <Navigate to="/profile" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedPw = password.trim();
    if (!trimmedEmail) { setError('Email address is required.'); return; }
    if (!trimmedPw) { setError('Password is required.'); return; }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email: trimmedEmail, password: trimmedPw });
      onLoginSuccess(data);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail(''); setPassword(''); setRememberMe(false); setError(null);
  };

  const handleFillDemo = () => {
    setEmail('priyasharma@gmail.com'); setPassword('password123'); setError(null);
  };

  return (
    <>
      <section className="flex justify-center items-center min-h-[calc(100vh-6rem)] px-4 py-12">
        <div className="bg-white shadow-xl rounded-3xl border border-pink-100/50 p-8 w-full max-w-md space-y-6">

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-pink-600 font-serif">Login</h2>
            <p className="text-xs text-gray-400">Access your beauty hub &amp; profile settings.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-sm">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700" htmlFor="login-email">Email Address</label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white transition"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700" htmlFor="login-pw">Password</label>
              <div className="relative">
                <input
                  id="login-pw"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white transition"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Remember + Demo */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-pink-600 w-4 h-4 rounded border-gray-300"
                />
                <span>Remember Me</span>
              </label>
              <button type="button" onClick={handleFillDemo} className="text-pink-600 hover:text-pink-700 font-bold hover:underline">
                Fill Demo Info
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-grow flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-pink-600/35 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <LogIn size={16} />
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-bold py-3.5 px-6 rounded-xl transition"
                title="Reset Form"
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </form>

          <p className="text-center text-sm pt-4 border-t border-pink-50 text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-pink-600 font-bold hover:underline">Create Account</Link>
          </p>

          {/* Admin Access Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-semibold tracking-wide uppercase">Admin Access</span>
            </div>
          </div>

          {/* Admin Login Button */}
          <button
            id="admin-login-btn"
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all duration-200 border-2 border-purple-500 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            }}
          >
            <span className="text-lg">👑</span>
            <span>Login as Admin</span>
          </button>

        </div>
      </section>

      {/* Admin Modal */}
      {showAdminModal && (
        <AdminLoginModal
          onClose={() => setShowAdminModal(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </>
  );
}
