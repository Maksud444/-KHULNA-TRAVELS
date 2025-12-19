import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('ইমেইল দিন');
      setLoading(false);
      return;
    }

    if (!formData.password || !formData.password.trim()) {
      setError('পাসওয়ার্ড দিন');
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

      const data = await response.json();
      
      // ⭐ DETAILED LOGGING - SEE EVERYTHING ⭐
      console.log('📥 FULL Response Data:', JSON.stringify(data, null, 2));
      console.log('📥 Response Keys:', Object.keys(data));
      console.log('📥 Has accessToken?', 'accessToken' in data);
      console.log('📥 Has token?', 'token' in data);
      console.log('📥 Has data?', 'data' in data);
      console.log('📥 Has user?', 'user' in data);

      // ⭐ CHECK ALL POSSIBLE TOKEN LOCATIONS ⭐
      const token = 
        data.accessToken || 
        data.token || 
        data.data?.accessToken || 
        data.data?.token ||
        data.access_token ||
        null;

      console.log('🔑 Token found:', !!token);
      if (token) {
        console.log('🔑 Token value:', token.substring(0, 50) + '...');
      }

      // ⭐ CHECK IF LOGIN WAS SUCCESSFUL ⭐
      const isSuccess = response.ok && token;

      console.log('✅ Is Success?', isSuccess);

      if (isSuccess) {
        console.log('✅✅✅ LOGIN SUCCESS! ✅✅✅');
        
        // Save token
        localStorage.setItem('token', token);
        console.log('💾 Token saved');

        // Extract user info from response or token
        let userName = formData.email.split('@')[0];
        let userEmail = formData.email;
        let userRole = 'customer';
        let userId = '';

        // Try to get user data from response
        if (data.user) {
          userName = data.user.name || userName;
          userEmail = data.user.email || userEmail;
          userRole = data.user.role || userRole;
          userId = data.user._id || data.user.id || '';
        } else if (data.data?.user) {
          userName = data.data.user.name || userName;
          userEmail = data.data.user.email || userEmail;
          userRole = data.data.user.role || userRole;
          userId = data.data.user._id || data.data.user.id || '';
        }

        // Try to decode token
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

        console.log('👤 User Info:', {
          userId,
          userName,
          userEmail,
          userRole
        });

        // Save user data
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userPhone', '');
        localStorage.setItem('role', userRole);
        
        const userObject = {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole
        };
        localStorage.setItem('user', JSON.stringify(userObject));

        console.log('💾 All data saved to localStorage');

        // Show success toast
        showToast(`✅ স্বাগতম, ${userName}!`, 'success');

        // Role-based redirect
        const role = userRole.toLowerCase().trim();
        let redirectPath = '/customer-dashboard';
        
        if (role === 'admin') {
          redirectPath = '/admin-dashboard';
        } else if (role === 'staff' || role === 'counter_staff') {
          redirectPath = '/staff-dashboard';
        }

        console.log('➡️ Redirecting to:', redirectPath);

        // Redirect with page reload
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);

      } else {
        // Login failed
        console.log('❌❌❌ LOGIN FAILED ❌❌❌');
        console.log('Reason: No token found in response');
        console.log('Response data:', data);
        
        const errorMsg = data.message || data.error || 'Invalid email or password';
        setError(errorMsg);
        showToast(`❌ ${errorMsg}`, 'error');
      }

    } catch (err) {
      console.error('💥💥💥 LOGIN ERROR 💥💥💥');
      console.error('Error:', err);
      const errorMsg = 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
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
        <p className="login-subtitle">স্বাগতম! আপনার অ্যাকাউন্টে লগইন করুন</p>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">পাসওয়ার্ড (Password) *</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'লগইন হচ্ছে...' : 'Login'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            অ্যাকাউন্ট নেই?{' '}
            <button
              type="button"
              className="switch-btn"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              রেজিস্টার করুন
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
      `}} />
    </div>
  );
};

export default Login;