import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');

      if (userId && role) {
        setUser({
          userId,
          role,
          name: userName,
          email: userEmail
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Fetch user data from JSON file
      const response = await fetch('/admin-staff-customer-data.json');
      const data = await response.json();

      // Check in all user types
      let foundUser = null;
      let userRole = null;

      // Check admins
      const admin = data.admins.find(u => u.email === email && u.password === password);
      if (admin) {
        foundUser = admin;
        userRole = 'admin';
      }

      // Check counter staff
      if (!foundUser) {
        const staff = data.counterStaff.find(u => u.email === email && u.password === password);
        if (staff) {
          foundUser = staff;
          userRole = 'counter_staff';
        }
      }

      // Check customers
      if (!foundUser) {
        const customer = data.customers.find(u => u.email === email && u.password === password);
        if (customer) {
          foundUser = customer;
          userRole = 'customer';
        }
      }

      if (foundUser) {
        // Store in localStorage
        localStorage.setItem('userId', foundUser.userId);
        localStorage.setItem('role', userRole);
        localStorage.setItem('userName', foundUser.name);
        localStorage.setItem('userEmail', foundUser.email);

        // Update state
        setUser({
          userId: foundUser.userId,
          role: userRole,
          name: foundUser.name,
          email: foundUser.email
        });
        setIsAuthenticated(true);

        return {
          success: true,
          role: userRole,
          user: foundUser
        };
      } else {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'counter_staff':
        return '/staff-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/';
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getDashboardRoute
  };

  // Don't block rendering while checking auth
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};