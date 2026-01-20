import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    // Phone validation (Bangladesh format)
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Enter valid phone number - 11 digits (01XXXXXXXXX)');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    console.log('✅ All validations passed');

    try {
      // Prepare data for backend - role is always 'user'
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'user'
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

      // Handle different response structures
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
          const userRole = 'user'; // Always user

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

        setSuccess('✅ Registration successful! Redirecting...');
        
        // Call parent callback
        if (onRegister) {
          onRegister(userData);
        }

        // Redirect to user dashboard after 1 second
        setTimeout(() => {
          console.log('➡️ Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1500);

      } else {
        // Registration failed
        console.log('❌ Registration failed');
        const errorMsg = message || data.error || 'Registration failed. Please try again.';
        console.log('❌ Error message:', errorMsg);
        setError(errorMsg);
      }

    } catch (err) {
      console.error('💥 Registration error (catch block):', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Invalid server response';
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
        <p className="register-subtitle">Join Khulna Travels</p>

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
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
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
            <label htmlFor="phone">Phone Number *</label>
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
            <small className="input-hint">11 digits (01XXXXXXXXX)</small>
          </div>

          {/* Password - Single field only */}
          <div className="form-group password-field">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength="6"
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <small className="input-hint">Must be at least 6 characters</small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="switch-btn"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;