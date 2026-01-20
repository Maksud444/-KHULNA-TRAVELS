import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onSwitchToRegister, onLogin }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Toast notification
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', formData.email);
    
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.email.trim()) {
      setError('Enter email');
      setLoading(false);
      return;
    }

    if (!formData.password || !formData.password.trim()) {
      setError('Enter password');
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      console.log('📤 Sending login request...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response OK:', response.ok);

      // Try to parse JSON safely
      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn('⚠️ Could not parse JSON response:', jsonErr);
      }

      console.log('📥 FULL Response Data:', JSON.stringify(data, null, 2));

      // Align success detection with Register.js
      const isSuccess = response.ok || data.success;

      // Extract token and user data in multiple possible shapes
      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken || data.access_token || null;
      const userData = data.user || data.data?.user || data.data || null;

      console.log('🔍 Parsed data:', { isSuccess, token, userData });

      if (isSuccess && (token || userData)) {
        console.log('✅✅✅ LOGIN SUCCESS! ✅✅✅');

        // Save token if present
        if (token) {
          localStorage.setItem('token', token);
          console.log('💾 Token saved');
        }

        // Normalize and save user info similar to Register
        let userName = formData.email.split('@')[0];
        let userEmail = formData.email;
        let userRole = 'user';
        let userId = '';
        let userPhone = '';

        if (userData) {
          userName = userData.name || userName;
          userEmail = userData.email || userEmail;
          userRole = userData.role || userRole;
          userId = userData._id || userData.id || userData.userId || userId;
          userPhone = userData.phone || userPhone;
        }

        // Try to decode token for extra info
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            console.log('🔓 Decoded token:', decoded);
            userId = userId || decoded.id || decoded.userId || '';
            userRole = decoded.role || userRole;
          } catch (err) {
            console.log('⚠️ Could not decode token');
          }
        }

        // Persist user data to localStorage (same keys as Register)
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userPhone', userPhone);
        localStorage.setItem('role', userRole);
        localStorage.setItem('user', JSON.stringify({
          _id: userId,
          id: userId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          role: userRole
        }));

        console.log('💾 User data saved to localStorage');

        // Show success toast
        showToast(`✅ Welcome, ${userName}!`, 'success');

        // Call optional onLogin callback
        if (typeof onLogin === 'function') {
          try { onLogin(userData || { name: userName, email: userEmail, id: userId }); } catch (e) { /* ignore */ }
        }

        // Redirect to dashboard (same as Register)
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);

      } else {
        // Login failed
        console.log('❌❌❌ LOGIN FAILED ❌❌❌');
        console.log('Response data:', data);

        const errorMsg = data.message || data.error || 'Invalid email or password';
        setError(errorMsg);
        showToast(`❌ ${errorMsg}`, 'error');
      }

    } catch (err) {
      console.error('💥💥💥 LOGIN ERROR 💥💥💥');
      console.error('Error:', err);
      const errorMsg = 'Problem logging in. Please try again.';
      setError(errorMsg);
      showToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Login to Khulna Travels</h2>
        <p className="login-subtitle">Welcome! Login to your account</p>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="form-group password-field">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
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
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="switch-btn"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Register
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          transform: translateX(400px);
          transition: transform 0.3s ease;
          z-index: 9999;
        }
        .toast.show {
          transform: translateX(0);
        }
        .toast-success {
          border-left: 4px solid #4caf50;
        }
        .toast-error {
          border-left: 4px solid #f44336;
        }

        /* Password toggle styles */
        .password-toggle { background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px; }
        .password-input-wrapper input { padding-right: 44px; }
      `}} />
    </div>
  );
};

export default Login;