import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== REGISTER FORM SUBMIT ===');
    console.log('Form Data:', formData);
    
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.name.trim()) {
      setError('নাম দিন (Name is required)');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('ইমেইল দিন (Email is required)');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('সঠিক ইমেইল দিন (Invalid email format)');
      setLoading(false);
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      setError('মোবাইল নম্বর দিন (Phone number is required)');
      setLoading(false);
      return;
    }

    // Phone validation (Bangladesh format)
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('সঠিক মোবাইল নম্বর দিন - ১১ ডিজিট (01XXXXXXXXX)');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না (Passwords do not match)');
      setLoading(false);
      return;
    }

    console.log('✅ All validations passed');

    try {
      // Prepare data for backend
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role || 'customer'
      };

      console.log('📤 Sending registration data to backend:', registrationData);
      console.log('🌐 API Endpoint:', `${API_BASE_URL}/auth/register`);

      // Call API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response OK:', response.ok);

      const data = await response.json();
      console.log('📥 Registration response data:', data);
      console.log('📥 Response structure:', {
        success: data.success,
        message: data.message,
        hasUser: !!data.user,
        hasData: !!data.data,
        hasToken: !!data.token
      });

      // Handle different response structures
      // Backend might return: { success, data: { user }, token }
      // Or: { success, user, token }
      // Or: { success, message }
      
      const isSuccess = response.ok || data.success;
      const userData = data.user || data.data?.user || data.data;
      const token = data.token || data.data?.token;
      const message = data.message;

      console.log('🔍 Parsed data:', {
        isSuccess,
        userData,
        token,
        message
      });

      if (isSuccess && userData) {
        console.log('✅ Registration successful!');
        console.log('👤 User data:', userData);
        console.log('🔑 Token:', token);

        // Save to localStorage
        if (token) {
          localStorage.setItem('token', token);
          console.log('💾 Token saved to localStorage');
        }

        if (userData) {
          // Save essential user info
          const userId = userData._id || userData.id;
          const userName = userData.name;
          const userEmail = userData.email;
          const userPhone = userData.phone;
          const userRole = userData.role || 'customer';

          localStorage.setItem('userId', userId);
          localStorage.setItem('userName', userName);
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('userPhone', userPhone);
          localStorage.setItem('role', userRole);
          
          // Save full user object
          localStorage.setItem('user', JSON.stringify(userData));

          console.log('💾 User data saved to localStorage:', {
            userId,
            userName,
            userEmail,
            userPhone,
            userRole
          });
        }

        setSuccess('✅ রেজিস্ট্রেশন সফল হয়েছে! Redirecting...');
        
        // Call parent callback
        if (onRegister) {
          onRegister(userData);
        }

        // Redirect based on role after 1 second
        setTimeout(() => {
          const userRole = userData?.role || 'customer';
          console.log('👤 User role:', userRole);
          console.log('➡️ Redirecting...');

          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (userRole === 'staff' || userRole === 'counter_staff') {
            navigate('/staff/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1500);

      } else {
        // Registration failed
        console.log('❌ Registration failed');
        console.log('❌ Reason: Response not OK or no user data');
        console.log('❌ Response status:', response.status);
        console.log('❌ Data.success:', data.success);
        console.log('❌ User data:', userData);
        
        const errorMsg = message || data.error || 'Registration failed. Please try again.';
        console.log('❌ Error message:', errorMsg);
        setError(errorMsg);
      }

    } catch (err) {
      console.error('💥 Registration error (catch block):', err);
      console.error('💥 Error type:', err.name);
      console.error('💥 Error message:', err.message);
      console.error('💥 Error stack:', err.stack);
      
      let errorMessage = 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন। (Registration failed. Please try again.)';
      
      if (err.message.includes('fetch')) {
        errorMessage = 'সার্ভারের সাথে সংযোগ করতে সমস্যা। (Cannot connect to server)';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'সার্ভার থেকে ভুল রেসপন্স এসেছে। (Invalid server response)';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">খুলনা ট্রাভেলসে যোগ দিন</p>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">নাম (Name) *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="আপনার নাম লিখুন"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">ইমেইল (Email) *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">মোবাইল নম্বর (Phone) *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="01712345678"
              value={formData.phone}
              onChange={handleChange}
              maxLength="11"
              required
              disabled={loading}
              autoComplete="tel"
            />
            <small className="input-hint">১১ ডিজিট (01XXXXXXXXX)</small>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">পাসওয়ার্ড (Password) *</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="পাসওয়ার্ড আবার লিখুন"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="customer">Customer (কাস্টমার)</option>
              <option value="staff">Counter Staff (স্টাফ)</option>
              <option value="admin">Admin (এডমিন)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="form-footer">
          <p>
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <button
              type="button"
              className="switch-btn"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              লগইন করুন
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;