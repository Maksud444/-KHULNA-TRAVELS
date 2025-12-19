import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('=== CHECKING AUTH STATUS ===');
    
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');
    
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('✅ Found existing session:', userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        
   
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No existing session found');
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    try {
      // If password is 'already-authenticated', user is already logged in from Login component
      if (password === 'already-authenticated') {
        console.log('ℹ️ Already authenticated, checking localStorage');
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('user');
        
        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setIsAuthenticated(true);
          
          console.log('✅ Session restored from localStorage');
          
          return {
            success: true,
            message: 'Login successful',
            role: userData.role,
            user: userData
          };
        }
      }
      
      // Otherwise, perform actual login
      console.log('📤 Calling backend login API');
      const response = await api.auth.login({ email, password });
      
      console.log('📥 Login response:', response);
      
      if (response.token) {
        // Save token
        localStorage.setItem('token', response.token);
        console.log('🔑 Token saved');
        
        // Save user data
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          setIsAuthenticated(true);
          console.log('👤 User data saved:', response.user);
          
          return {
            success: true,
            message: response.message || 'Login successful',
            role: response.user.role,
            user: response.user
          };
        }
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
      
    } catch (error) {
      console.error('💥 Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData) => {
    console.log('=== REGISTER ATTEMPT ===');
    console.log('User data:', userData);
    
    try {
      console.log('📤 Calling backend register API');
      const response = await api.auth.register(userData);
      
      console.log('📥 Register response:', response);
      
      if (response.token) {
        // Save token
        localStorage.setItem('token', response.token);
        console.log('🔑 Token saved');
        
        // Save user data
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          setIsAuthenticated(true);
          console.log('👤 User data saved:', response.user);
          
          return {
            success: true,
            message: response.message || 'Registration successful',
            user: response.user
          };
        }
      }
      
      return {
        success: false,
        message: response.message || 'Registration failed'
      };
      
    } catch (error) {
      console.error('💥 Register error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    console.log('=== LOGOUT ===');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ Logout successful');
    
    // Optional: Call backend logout API
    // api.auth.logout().catch(err => console.error('Logout API error:', err));
  };

  const updateUser = (newUserData) => {
    console.log('=== UPDATING USER DATA ===');
    console.log('New data:', newUserData);
    
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('✅ User data updated');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #03256c 0%, #0652DD 100%)',
        color: 'white',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;