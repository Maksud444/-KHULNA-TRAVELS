import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Header from './components/Header';

// Import your pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RoutesPage from './pages/RoutesPage';
import ContactPage from './pages/ContactPage';
import BusListPage from './pages/BusListPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/CounterStaffDashboard';
import CustomerDashboard from './pages/UserDashboard';

// Import Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  console.log('🔒 Protected Route Check:', {
    hasToken: !!token,
    userRole,
    allowedRoles
  });

  // Not logged in - redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('❌ Role not allowed:', userRole, 'Allowed:', allowedRoles);
    
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === 'staff' || userRole === 'counter_staff') {
      return <Navigate to="/staff-dashboard" replace />;
    } else {
      return <Navigate to="/customer-dashboard" replace />;
    }
  }

  // Role is allowed - show the page
  console.log('✅ Access granted');
  return children;
};

// 404 Page Component
const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: '20px'
  }}>
    <h1 style={{ fontSize: '72px', margin: '0', color: '#03256c' }}>404</h1>
    <h2 style={{ margin: '20px 0' }}>পেজ পাওয়া যায়নি</h2>
    <p style={{ marginBottom: '30px', color: '#666' }}>
      আপনি যে পেজটি খুঁজছেন সেটি বিদ্যমান নেই।
    </p>
    <button
      onClick={() => window.location.href = '/'}
      style={{
        padding: '12px 30px',
        fontSize: '16px',
        background: '#03256c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      হোম পেজে ফিরে যান
    </button>
  </div>
);

function App() {
  // Check if user is already logged in
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Helper function to get role-based dashboard
  const getRoleBasedDashboard = () => {
    if (userRole === 'admin') {
      return '/admin-dashboard';
    } else if (userRole === 'staff' || userRole === 'counter_staff') {
      return '/staff-dashboard';
    } else {
      return '/customer-dashboard';
    }
  };

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          {/* Header is inside AuthProvider ✅ */}
          <Header />
          
          {/* Main Content */}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/bus-list" element={<BusListPage />} />
              <Route path="/seat-selection" element={<SeatSelectionPage />} />
              <Route path="/payment" element={<PaymentPage />} />

              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? (
                    <Navigate to={getRoleBasedDashboard()} replace />
                  ) : (
                    <Login />
                  )
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? (
                    <Navigate to={getRoleBasedDashboard()} replace />
                  ) : (
                    <Register />
                  )
                } 
              />

              {/* Protected Dashboard Routes */}
              
              {/* Admin Dashboard - Only admin can access */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
              
              {/* Staff Dashboard - Only staff can access */}
              <Route 
                path="/staff-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['staff', 'counter_staff', 'counter-staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/staff" element={<Navigate to="/staff-dashboard" replace />} />
              
              {/* Customer Dashboard - Only customers can access */}
              <Route 
                path="/customer-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'user']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/user-dashboard" element={<Navigate to="/customer-dashboard" replace />} />
              <Route path="/dashboard" element={<Navigate to="/customer-dashboard" replace />} />

              {/* 404 - Catch all unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer (Optional) */}
          <footer style={{
            background: '#03256c',
            color: 'white',
            padding: '30px 0',
            marginTop: '50px',
            textAlign: 'center'
          }}>
            <div className="container">
              <p style={{ margin: '0', fontSize: '14px' }}>
                © 2024 Khulna Travels. All Rights Reserved.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: '12px', opacity: 0.8 }}>
                হটলাইন: ০১৮৩৪২০১৬২৮ | ইমেইল: info@khulnatravels.com
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;