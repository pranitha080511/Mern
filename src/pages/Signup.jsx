import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
    skinType: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!form.fullName.trim()) {
      tempErrors.fullName = 'Full name is required.';
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      tempErrors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailPattern.test(form.email)) {
      tempErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    const phonePattern = /^\+?[0-9\s()-]{7,15}$/;
    if (!form.phone.trim()) {
      tempErrors.phone = 'Phone number is required.';
      isValid = false;
    } else if (!phonePattern.test(form.phone)) {
      tempErrors.phone = 'Please enter a valid phone number.';
      isValid = false;
    }

    if (!form.dob) {
      tempErrors.dob = 'Date of birth is required.';
      isValid = false;
    }

    if (!form.gender) {
      tempErrors.gender = 'Please select your gender.';
      isValid = false;
    }

    if (!form.password) {
      tempErrors.password = 'Password is required.';
      isValid = false;
    } else if (form.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters.';
      isValid = false;
    }

    if (!form.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    if (!form.skinType) {
      tempErrors.skinType = 'Please select a skin type.';
      isValid = false;
    }

    if (!form.terms) {
      tempErrors.terms = 'You must agree to the Terms & Conditions.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await api.post('/api/auth/register', {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          skinType: form.skinType
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/login');
        }, 2500);
      } catch (err) {
        console.error(err);
        setErrors({ apiError: err.message || 'Registration failed. Please try again.' });
      }
    }
  };

  const handleReset = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      password: '',
      confirmPassword: '',
      skinType: '',
      terms: false
    });
    setErrors({});
    setSuccess(false);
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-6rem)] px-4 py-12">
      <div className="bg-white shadow-xl rounded-3xl border border-pink-100/50 p-8 w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-pink-600 font-serif">
            Create Account
          </h2>
          <p className="text-xs text-gray-400">Join the Hikari's Luxe beauty circle.</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
            <h3 className="text-xl font-bold">Account Created!</h3>
            <p className="text-sm">Welcome to our cosmetics world. Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm" noValidate>
            
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold animate-shake">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errors.apiError || 'Please correct the errors in the fields below.'}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="block font-semibold text-gray-700" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                    errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                  }`}
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block font-semibold text-gray-700" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                  }`}
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                    }`}
                  />
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-gray-700" htmlFor="dob">Date of Birth</label>
                <div className="relative">
                  <input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                      errors.dob ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                    }`}
                  />
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.dob && <p className="text-red-600 text-xs mt-1">{errors.dob}</p>}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="block font-semibold text-gray-700">Gender</label>
              <div className="flex gap-6 py-2">
                {['Female', 'Male', 'Other'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer font-medium text-gray-600 select-none">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="accent-pink-600 w-4 h-4"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-red-600 text-xs">{errors.gender}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                    }`}
                  />
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                    }`}
                  />
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Skin Type Selection */}
            <div className="space-y-1">
              <label className="block font-semibold text-gray-700" htmlFor="skinType">Select Skin Type</label>
              <select
                id="skinType"
                value={form.skinType}
                onChange={(e) => setForm({ ...form, skinType: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition text-sm ${
                  errors.skinType ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
              >
                <option value="">Choose your skin type</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Normal">Normal</option>
              </select>
              {errors.skinType && <p className="text-red-600 text-xs mt-1">{errors.skinType}</p>}
            </div>

            {/* Terms and Conditions checkbox */}
            <div className="space-y-1 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="accent-pink-600 w-4 h-4 rounded border-gray-300 focus:ring-pink-500"
                />
                <span>I agree to the Terms & Conditions</span>
              </label>
              {errors.terms && <p className="text-red-600 text-xs mt-1">{errors.terms}</p>}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-6 border-t border-pink-50">
              <button
                type="submit"
                className="flex-grow flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-pink-600/35 transition duration-200"
              >
                <ShieldCheck size={18} />
                <span>Create Account</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-3.5 px-6 rounded-xl transition"
              >
                Reset
              </button>
            </div>

          </form>
        )}

        <p className="text-center text-sm pt-4 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </section>
  );
}
