import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import CounterStaffDashboard from './pages/CounterStaffDashboard';
import UserDashboard from './pages/UserDashboard';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BusListPage from './pages/BusListPage';
import PaymentPage from './pages/PaymentPageNew';
import PaymentStatus from './pages/PaymentStatus';
import PaymentResult from './pages/PaymentResult';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/staff-dashboard" element={<CounterStaffDashboard />} />
          <Route path="/customer-dashboard" element={<UserDashboard />} />
          <Route path="/seat-selection" element={<SeatSelectionPage />} />
          <Route path="/bus-list" element={<BusListPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/status" element={<PaymentStatus />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;