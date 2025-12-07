import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-section" onClick={() => navigate('/')}>
          <div className="logo-icon-animated">🚌</div>
          <h1 className="company-name">KHULNA TRAVELS</h1>
          <p className="tagline">আপনার বিশ্বস্ত যাত্রা সঙ্গী</p>
        </div>

        <nav className="nav-menu">
          <button className="nav-link" onClick={() => navigate('/')}>
            🏠 হোম
          </button>
          <button className="nav-link" onClick={() => navigate('/about')}>
            ℹ️ আমাদের সম্পর্কে
          </button>
          <button className="nav-link" onClick={() => navigate('/contact')}>
            📞 যোগাযোগ
          </button>
        </nav>

        <div className="contact-info">
          <span className="phone">📱 01834201628</span>
        </div>
      </div>
    </header>
  );
};

export default Header;