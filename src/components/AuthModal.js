import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Sign In Form State
  const [signInData, setSignInData] = useState({
    phoneOrEmail: '',
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    phone: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        name: 'যাত্রী',
        email: signInData.phoneOrEmail
      }));
      setIsLoading(false);
      onClose();
      navigate('/');
    }, 1500);
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!signUpData.phone) newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    if (!signUpData.email) newErrors.email = 'ইমেইল প্রয়োজন';
    if (!signUpData.fullName) newErrors.fullName = 'নাম প্রয়োজন';
    if (!signUpData.password) newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        name: signUpData.fullName,
        email: signUpData.email,
        phone: signUpData.phone
      }));
      setIsLoading(false);
      alert('রেজিস্ট্রেশন সফল!');
      onClose();
      navigate('/');
    }, 1500);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-modal-content">
          {/* Left Side - Form */}
          <div className="auth-form-section">
            {/* Tab Buttons */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => setActiveTab('signin')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form className="auth-form" onSubmit={handleSignIn}>
                <div className="form-field">
                  <label>PHONE NUMBER / EMAIL</label>
                  <input
                    type="text"
                    placeholder="Phone Number/Email"
                    value={signInData.phoneOrEmail}
                    onChange={(e) => setSignInData({
                      ...signInData,
                      phoneOrEmail: e.target.value
                    })}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? 'লগইন হচ্ছে...' : 'Request Code'}
                </button>

                <div className="auth-footer-links">
                  <p>Have a password? <a href="#" className="link-red">Click Here</a></p>
                  <p>Need an account? <a href="#" className="link-red" onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('signup');
                  }}>Sign Up</a></p>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form className="auth-form" onSubmit={handleSignUp}>
                <div className="form-field">
                  <label>PHONE</label>
                  <input
                    type="tel"
                    placeholder="+8801789384728"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({
                      ...signUpData,
                      phone: e.target.value
                    })}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-field">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    placeholder="mr.portabella@gmail.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({
                      ...signUpData,
                      email: e.target.value
                    })}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label>FULL NAME</label>
                  <input
                    type="text"
                    placeholder="Mr. Portabella"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({
                      ...signUpData,
                      fullName: e.target.value
                    })}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({
                        ...signUpData,
                        password: e.target.value
                      })}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                  </div>

                  <div className="form-field">
                    <label>CONFIRM PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value
                      })}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? 'রেজিস্টার হচ্ছে...' : 'Sign Up'}
                </button>

                <div className="auth-footer-links">
                  <p>Have an account? <a href="#" className="link-red" onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('signin');
                  }}>Log In</a></p>
                </div>
              </form>
            )}
          </div>

          {/* Right Side - Illustration */}
          <div className="auth-illustration-section">
            <div className="illustration-container">
              {/* Sun */}
              <div className="sun">
                <div className="sun-rays"></div>
              </div>

              {/* Clouds */}
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>

              {/* Bus */}
              <div className="bus-container">
                <svg viewBox="0 0 200 100" className="bus-svg">
                  {/* Bus Body */}
                  <rect x="20" y="30" width="160" height="50" rx="15" fill="#d32f2f"/>
                  <rect x="25" y="35" width="150" height="40" rx="10" fill="#b71c1c"/>
                  
                  {/* Windows */}
                  <rect x="30" y="40" width="25" height="20" rx="3" fill="#555"/>
                  <rect x="60" y="40" width="25" height="20" rx="3" fill="#555"/>
                  <rect x="90" y="40" width="25" height="20" rx="3" fill="#555"/>
                  <rect x="120" y="40" width="25" height="20" rx="3" fill="#555"/>
                  <rect x="150" y="40" width="20" height="20" rx="3" fill="#555"/>
                  
                  {/* Front */}
                  <path d="M 20 50 Q 15 50 15 45 L 15 35 Q 15 30 20 30" fill="#c62828"/>
                  
                  {/* Wheels */}
                  <circle cx="50" cy="80" r="12" fill="#333"/>
                  <circle cx="50" cy="80" r="6" fill="#666"/>
                  <circle cx="150" cy="80" r="12" fill="#333"/>
                  <circle cx="150" cy="80" r="6" fill="#666"/>
                  
                  {/* Details */}
                  <rect x="30" y="65" width="140" height="8" rx="2" fill="#fff" opacity="0.3"/>
                </svg>
              </div>

              {/* Trees */}
              <div className="tree tree-1">
                <div className="tree-trunk"></div>
                <div className="tree-top"></div>
              </div>
              <div className="tree tree-2">
                <div className="tree-trunk"></div>
                <div className="tree-top"></div>
              </div>
              <div className="tree tree-3">
                <div className="tree-trunk"></div>
                <div className="tree-top"></div>
              </div>

              {/* Ticket Counter */}
              <div className="ticket-counter">
                <div className="counter-building"></div>
                <div className="counter-window"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;