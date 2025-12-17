import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: performLogin, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  // Mobile menu toggle
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAuthModalOpen = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setFormData({ email: '', password: '', name: '', phone: '' });
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setError('');
    setFormData({ email: '', password: '', name: '', phone: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingForm(true);

    const result = await performLogin(formData.email, formData.password);

    setLoadingForm(false);

    if (result.success) {
      handleAuthModalClose();
      
      switch (result.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'counter_staff':
          navigate('/staff-dashboard');
          break;
        case 'customer':
          navigate('/customer-dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingForm(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('সব ফিল্ড পূরণ করুন');
      setLoadingForm(false);
      return;
    }

    if (formData.phone.length !== 11) {
      setError('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)');
      setLoadingForm(false);
      return;
    }

    setTimeout(() => {
      setLoadingForm(false);
      alert('Registration successful! Please login.');
      setAuthMode('login');
      setFormData({ email: '', password: '', name: '', phone: '' });
    }, 1000);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>
              <h1>KHULNA TRAVELS</h1>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            <nav className={`nav-menu ${mobileOpen ? 'nav-open' : ''}`}>
              {!isAuthenticated ? (
                <>
                  <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
                  <Link to="/about" className="nav-link" onClick={() => setMobileOpen(false)}>About</Link>
                  <Link to="/routes" className="nav-link" onClick={() => setMobileOpen(false)}>Routes</Link>
                  <Link to="/contact" className="nav-link" onClick={() => setMobileOpen(false)}>Contact</Link>
                  <button 
                    className="auth-btn login-btn"
                    onClick={() => { setMobileOpen(false); handleAuthModalOpen('login'); }}
                  >
                    Login
                  </button>
                  <button 
                    className="auth-btn register-btn"
                    onClick={() => { setMobileOpen(false); handleAuthModalOpen('register'); }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
                  
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      <Link to="/admin-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Bookings</Link>
                      <Link to="/admin-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Buses</Link>
                      <Link to="/admin-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Staff</Link>
                    </>
                  )}

                  {user.role === 'counter_staff' && (
                    <>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>New Booking</Link>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>My Bookings</Link>
                    </>
                  )}

                  {user.role === 'customer' && (
                    <>
                      <Link to="/customer-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      <Link to="/customer-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>My Trips</Link>
                      <Link to="/routes" className="nav-link" onClick={() => setMobileOpen(false)}>Book Ticket</Link>
                    </>
                  )}

                  <div className="user-menu">
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-role">
                        {user.role === 'admin' && 'Admin'}
                        {user.role === 'counter_staff' && 'Staff'}
                        {user.role === 'customer' && 'Customer'}
                      </span>
                    </div>
                    <button className="logout-btn-header" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleAuthModalClose}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleAuthModalClose}>✕</button>

            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
              <p>{authMode === 'login' ? 'Login to your account' : 'Create a new account'}</p>
            </div>

            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>নাম *</label>
                    <input type="text" name="name" placeholder="আপনার নাম লিখুন" value={formData.name} onChange={handleInputChange} required />
                  </div>
                )}

                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleInputChange} required />
                </div>

                {authMode === 'register' && (
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input type="tel" name="phone" placeholder="01712345678" value={formData.phone} onChange={handleInputChange} maxLength="11" required />
                  </div>
                )}

                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                </div>

                <button type="submit" className="submit-btn" disabled={loadingForm}>
                  {loadingForm ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Register')}
                </button>
              </form>

              <div className="modal-footer">
                {authMode === 'login' ? (
                  <p>Don't have an account? <button className="switch-mode-btn" onClick={() => setAuthMode('register')}>Register here</button></p>
                ) : (
                  <p>Already have an account? <button className="switch-mode-btn" onClick={() => setAuthMode('login')}>Login here</button></p>
                )}
              </div>

              <div className="test-credentials">
                <p className="test-title">Test Login Credentials:</p>
                <div className="test-users">
                  <div className="test-user"><strong>Admin:</strong> <span>admin@khulnatravels.com / admin123</span></div>
                  <div className="test-user"><strong>Staff:</strong> <span>counter1@khulnatravels.com / staff123</span></div>
                  <div className="test-user"><strong>Customer:</strong> <span>rahim@example.com / password123</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;