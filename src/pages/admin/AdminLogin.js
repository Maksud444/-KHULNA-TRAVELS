import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin info
        localStorage.setItem('userId', data.data.adminId || data.data.id);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('adminName', data.data.name);

        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo/Header */}
          <div className="login-header">
            <div className="logo-container">
              <span className="logo-icon">🚌</span>
              <h1>খুলনা ট্রাভেলস</h1>
            </div>
            <h2>Admin Panel</h2>
            <p>অ্যাডমিন লগইন করুন</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">ইউজারনেম</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="আপনার ইউজারনেম লিখুন"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">পাসওয়ার্ড</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  লগইন হচ্ছে...
                </>
              ) : (
                'লগইন করুন'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>অ্যাডমিন অ্যাক্সেস শুধুমাত্র অনুমোদিত ব্যবহারকারীদের জন্য</p>
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              ← হোমপেজে ফিরে যান
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="login-side-panel">
          <div className="panel-content">
            <h3>অ্যাডমিন প্যানেল</h3>
            <ul className="features-list">
              <li>
                <span className="feature-icon">📊</span>
                <span>সম্পূর্ণ ড্যাশবোর্ড</span>
              </li>
              <li>
                <span className="feature-icon">🚌</span>
                <span>বাস ম্যানেজমেন্ট</span>
              </li>
              <li>
                <span className="feature-icon">🛣️</span>
                <span>রুট ম্যানেজমেন্ট</span>
              </li>
              <li>
                <span className="feature-icon">👥</span>
                <span>স্টাফ ম্যানেজমেন্ট</span>
              </li>
              <li>
                <span className="feature-icon">👤</span>
                <span>কাস্টমার ম্যানেজমেন্ট</span>
              </li>
              <li>
                <span className="feature-icon">📝</span>
                <span>বুকিং ম্যানেজমেন্ট</span>
              </li>
              <li>
                <span className="feature-icon">📈</span>
                <span>রিপোর্ট ও বিশ্লেষণ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;