import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Login({ user, onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to profile immediately
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPw = password.trim();

    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (!trimmedPw) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', {
        email: trimmedEmail,
        password: trimmedPw
      });

      onLoginSuccess(data);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setRememberMe(false);
    setError(null);
  };

  const handleFillDemo = () => {
    setEmail('priyasharma@gmail.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-6rem)] px-4 py-12">
      <div className="bg-white shadow-xl rounded-3xl border border-pink-100/50 p-8 w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-pink-600 font-serif">
            Login
          </h2>
          <p className="text-xs text-gray-400">Access your beauty hub & profile settings.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-sm">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700" htmlFor="login-email">Email Address</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white transition"
              />
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700" htmlFor="login-pw">Password</label>
            <div className="relative">
              <input
                id="login-pw"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white transition"
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Helper checkbox & demo credentials */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-pink-600 w-4 h-4 rounded border-gray-300 focus:ring-pink-500"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-pink-600 hover:text-pink-700 font-bold hover:underline"
            >
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
              className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-250 text-gray-700 border border-gray-300 font-bold py-3.5 px-6 rounded-xl transition"
              title="Reset Form"
            >
              <RefreshCw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </form>

        <p className="text-center text-sm pt-4 border-t border-pink-50 text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pink-600 font-bold hover:underline">
            Create Account
          </Link>
        </p>

      </div>
    </section>
  );
}
