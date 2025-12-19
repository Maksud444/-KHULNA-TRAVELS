// src/components/Auth/AuthModal.js
import React, { useState } from 'react';
import Login from './Auth/Login';
import Register from './Auth/Register';


export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  if (!isOpen) return null;

  const handleLoginSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    onClose();
  };

  const handleRegisterSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-tab-content">
          {activeTab === 'login' ? (
            <Login
              onLogin={handleLoginSuccess}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <Register
              onRegister={handleRegisterSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}