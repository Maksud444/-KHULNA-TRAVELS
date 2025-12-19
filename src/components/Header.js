import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Auth/Login';
import Register from './Auth/Register';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: performLogin, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Mobile menu toggle
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => { 
      document.body.style.overflow = ''; 
    };
  }, [mobileOpen]);

  // Lock body scroll when auth modal open
  React.useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => { 
      document.body.style.overflow = ''; 
    };
  }, [showAuthModal]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const handleAuthModalOpen = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileOpen(false); // Close mobile menu
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleLoginSuccess = async (userData) => {
    console.log('Login successful in Header:', userData);
    
    // Update auth context
    await performLogin(userData.email, 'already-authenticated');
    
    // Close modal
    handleAuthModalClose();
    
    // Navigate based on role
    switch (userData.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'staff':
      case 'counter_staff':
        navigate('/staff-dashboard');
        break;
      case 'user':
      case 'customer':
        navigate('/customer-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleRegisterSuccess = async (userData) => {
    console.log('Register successful in Header:', userData);
    
    // If registration returns token, log user in automatically
    if (userData && userData.email) {
      await performLogin(userData.email, 'already-authenticated');
      handleAuthModalClose();
      
      // Navigate to appropriate dashboard
      switch (userData.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'staff':
        case 'counter_staff':
          navigate('/staff-dashboard');
          break;
        case 'user':
        case 'customer':
          navigate('/customer-dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      // If no auto-login, switch to login form
      alert('Registration successful! Please login with your credentials.');
      setAuthMode('login');
    }
  };

  const handleSwitchToRegister = () => {
    setAuthMode('register');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
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
                    onClick={() => handleAuthModalOpen('login')}
                  >
                    Login
                  </button>
                  <button 
                    className="auth-btn register-btn"
                    onClick={() => handleAuthModalOpen('register')}
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

                  {(user.role === 'counter_staff' || user.role === 'staff') && (
                    <>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>New Booking</Link>
                      <Link to="/staff-dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>My Bookings</Link>
                    </>
                  )}

                  {(user.role === 'customer' || user.role === 'user') && (
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
                        {(user.role === 'counter_staff' || user.role === 'staff') && 'Staff'}
                        {(user.role === 'customer' || user.role === 'user') && 'Customer'}
                      </span>
                    </div>
                    <button className="logout-btn-header" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Auth Modal with new Login/Register components */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleAuthModalClose}>
          <div className="auth-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleAuthModalClose}>
              ✕
            </button>

            <div className="auth-modal-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <div className="auth-modal-content">
              {authMode === 'login' ? (
                <Login 
                  onLogin={handleLoginSuccess}
                  onSwitchToRegister={handleSwitchToRegister}
                />
              ) : (
                <Register 
                  onRegister={handleRegisterSuccess}
                  onSwitchToLogin={handleSwitchToLogin}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;