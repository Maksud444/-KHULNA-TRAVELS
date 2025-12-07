import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BusListPage from './pages/BusListPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage'; // ADD
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bus-list" element={<BusListPage />} />
          <Route path="/seat-selection" element={<SeatSelectionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} /> {/* ADD */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;