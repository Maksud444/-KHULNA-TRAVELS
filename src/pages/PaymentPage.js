import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';
import paymentService from '../services/paymentService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const rawState = location.state || {};

  const bookingData = {
    bus: rawState.bus || { name: 'KHULNA TRAVELS', type: 'NON AC', fare: 950 },
    selectedSeats: rawState.selectedSeats || [],
    passengerDetails: rawState.passengerDetails || { name: '', phone: '', boardingPoint: '' },
    searchData: rawState.searchData || { from: 'Khulna', to: 'Kuakata', journeyDate: new Date().toISOString().split('T')[0] },
    totalAmount: rawState.totalAmount || 0
  };

  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Boarding Points from your admin panel
  const boardingPoints = [
    { id: 1, name: 'Apil Gate', location: 'খুলনা', time: '10:30 PM' },
    { id: 2, name: 'Boyra Bazar', location: 'খুলনা', time: '10:35 PM' },
    { id: 3, name: 'Daulatpur', location: 'খুলনা', time: '10:45 PM' },
    { id: 4, name: 'Fulbari Gate', location: 'খুলনা', time: '10:50 PM' },
    { id: 5, name: 'Fultola', location: 'খুলনা', time: '11:00 PM' },
    { id: 6, name: 'Gallamari', location: 'খুলনা', time: '11:10 PM' },
    { id: 7, name: 'Jabusha Chowrasta', location: 'খুলনা', time: '11:15 PM' },
    { id: 8, name: 'Katakhali', location: 'খুলনা', time: '11:20 PM' },
    { id: 9, name: 'Jessore', location: 'যশোর', time: '9:30 PM' },
    { id: 10, name: 'Noapara', location: 'নোয়াপাড়া', time: '10:00 PM' }
  ];

  // Payment methods
  const paymentMethods = [
    { 
      id: 'bkash', 
      name: 'bKash', 
      icon: '💳',
      color: '#E2136E',
      popular: true,
      description: 'পেমেন্ট করুন bKash দিয়ে'
    },
    { 
      id: 'nagad', 
      name: 'Nagad', 
      icon: '🏦',
      color: '#EE4023',
      popular: true,
      description: 'নগদ দিয়ে সহজে পেমেন্ট'
    },
    { 
      id: 'rocket', 
      name: 'Rocket', 
      icon: '🚀',
      color: '#8B3A8F',
      popular: false,
      description: 'রকেট একাউন্ট দিয়ে পেমেন্ট'
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: '💳',
      color: '#2C5282',
      popular: false,
      description: 'ভিসা, মাস্টারকার্ড দিয়ে পেমেন্ট'
    },
    { 
      id: 'bank', 
      name: 'Internet Banking', 
      icon: '🏛️',
      color: '#276749',
      popular: false,
      description: 'ব্যাংক একাউন্ট দিয়ে পেমেন্ট'
    }
  ];

  // Calculate prices - NO VAT
  const basePrice = (bookingData.bus?.fare || 0) * (bookingData.selectedSeats?.length || 0);
  const serviceFee = 0; // No service charge
  const totalPrice = bookingData.totalAmount || (basePrice + serviceFee); // NO VAT

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('সময় শেষ! আপনার booking cancel হয়ে গেছে।');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      alert('দয়া করে পেমেন্ট মেথড নির্বাচন করুন');
      return;
    }

    if (!agreeTerms) {
      alert('দয়া করে শর্তাবলী মেনে নিন');
      return;
    }

    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'bkash') {
        const res = await paymentService.createBkashPayment({ amount: totalPrice, booking: bookingData });

        // If gateway provides a checkout/redirect URL, go there
        const redirect = res?.redirectUrl || res?.checkout_url || res?.payment_url;
        const paymentId = res?.payment_id || res?.paymentId || res?.transaction_id;

        if (redirect) {
          // store pending payment id (if any) and redirect
          if (paymentId) paymentService.setPendingPayment(paymentId);
          window.location.href = redirect;
          return;
        }

        // If we have a payment id, poll status
        if (paymentId) {
          paymentService.setPendingPayment(paymentId);
          const start = Date.now();
          let status = null;
          while (Date.now() - start < 30000) {
            // eslint-disable-next-line no-await-in-loop
            const st = await paymentService.checkPaymentStatus(paymentId);
            status = st?.status;
            if (status === 'SUCCESS' || status === 'FAILED') break;
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, 2000));
          }

          paymentService.clearPendingPayment();

          if (status === 'SUCCESS') {
            navigate('/confirmation', { state: { ...bookingData, paymentMethod, totalPrice, bookingId: paymentId, paymentStatus: 'SUCCESS' } });
            return;
          }

          alert('Payment_failed_or_timed_out');
          return;
        }

        // otherwise fallthrough to error
        throw new Error('Unexpected bKash response');
      }

      if (paymentMethod === 'sslcommerz') {
        const res = await paymentService.initSSLCommerzPayment({ amount: totalPrice, booking: bookingData });
        const redirect = res?.redirectUrl || res?.GatewayPageURL;
        const paymentId = res?.tran_id || res?.payment_id || res?.paymentId;

        if (redirect) {
          if (paymentId) paymentService.setPendingPayment(paymentId);
          window.location.href = redirect;
          return;
        }

        if (paymentId) {
          // Poll
          paymentService.setPendingPayment(paymentId);
          const start = Date.now();
          let status = null;
          while (Date.now() - start < 30000) {
            // eslint-disable-next-line no-await-in-loop
            const st = await paymentService.checkPaymentStatus(paymentId);
            status = st?.status;
            if (status === 'SUCCESS' || status === 'FAILED') break;
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, 2000));
          }

          paymentService.clearPendingPayment();

          if (status === 'SUCCESS') {
            navigate('/confirmation', { state: { ...bookingData, paymentMethod, totalPrice, bookingId: paymentId, paymentStatus: 'SUCCESS' } });
            return;
          }

          alert('Payment_failed_or_timed_out');
          return;
        }

        throw new Error('Unexpected SSLCommerz response');
      }

      // Fallback for other methods (simulated success)
      navigate('/confirmation', { state: { ...bookingData, paymentMethod, totalPrice, bookingId: 'KT' + Date.now(), paymentStatus: 'SUCCESS' } });

    } catch (err) {
      console.error('Payment initiation failed', err);
      alert('Payment initiation failed: ' + (err.message || err));
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="payment-page-pro">
      {/* Header */}
      <header className="header-payment">
        <div className="container">
          <div className="header-content">
            <div className="logo-section" onClick={() => navigate('/')}>
              <span className="logo-icon">🚌</span>
              <span className="logo-text">Khulna Travels</span>
            </div>
            <div className="timer-badge">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">সময় বাকি: {formatTime(countdown)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <section className="progress-section">
        <div className="container">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-circle">✓</div>
              <span className="step-label">বাস নির্বাচন</span>
            </div>
            <div className="step-line completed"></div>
            <div className="step completed">
              <div className="step-circle">✓</div>
              <span className="step-label">সিট নির্বাচন</span>
            </div>
            <div className="step-line active"></div>
            <div className="step active">
              <div className="step-circle">3</div>
              <span className="step-label">পেমেন্ট</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-circle">4</div>
              <span className="step-label">কনফার্মেশন</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="payment-layout">
          {/* Left Section - Payment Methods */}
          <div className="payment-methods-section">
            <div className="section-card">
              <h2 className="section-title">
                <span className="title-icon">💳</span>
                পেমেন্ট মেথড নির্বাচন করুন
              </h2>

              <div className="payment-methods-grid">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    {method.popular && (
                      <div className="popular-tag">জনপ্রিয়</div>
                    )}
                    <div className="method-icon" style={{ color: method.color }}>
                      {method.icon}
                    </div>
                    <div className="method-info">
                      <h3 className="method-name">{method.name}</h3>
                      <p className="method-description">{method.description}</p>
                    </div>
                    <div className="select-indicator">
                      {paymentMethod === method.id && <span className="checkmark">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boarding Point Selection */}
            <div className="section-card">
              <h2 className="section-title">
                <span className="title-icon">📍</span>
                বোর্ডিং পয়েন্ট
              </h2>

              <div className="boarding-points-grid">
                {boardingPoints
                  .filter(point => 
                    point.location.includes('খুলনা') || 
                    bookingData.searchData.from === 'Jessore' && point.location.includes('যশোর') ||
                    bookingData.searchData.from === 'Noapara' && point.location.includes('নোয়াপাড়া')
                  )
                  .map(point => (
                    <div key={point.id} className="boarding-point-card">
                      <div className="point-icon">📍</div>
                      <div className="point-details">
                        <h4 className="point-name">{point.name}</h4>
                        <p className="point-time">⏰ {point.time}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Terms */}
            <div className="terms-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="checkbox-text">
                  আমি <a href="#terms">শর্তাবলী</a> এবং <a href="#policy">গোপনীয়তা নীতি</a> মেনে নিচ্ছি
                </span>
              </label>
            </div>
          </div>

          {/* Right Section - Booking Summary */}
          <aside className="booking-summary-section">
            <div className="summary-card sticky">
              <h3 className="summary-title">বুকিং সারসংক্ষেপ</h3>

              {/* Journey Info */}
              <div className="journey-summary">
                <div className="route-display">
                  <span className="route-from">{bookingData.searchData.from}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{bookingData.searchData.to}</span>
                </div>
                <div className="date-display">
                  <span className="icon">📅</span>
                  {new Date(bookingData.searchData.journeyDate).toLocaleDateString('bn-BD')}
                </div>
              </div>

              {/* Bus Info */}
              <div className="info-row">
                <span className="info-label">বাস:</span>
                <span className="info-value">{bookingData.bus.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ধরন:</span>
                <span className="info-value">{bookingData.bus.type}</span>
              </div>

              {/* Seats */}
              <div className="info-row highlight">
                <span className="info-label">সিট নম্বর:</span>
                <span className="info-value seats">
                  {bookingData.selectedSeats.join(', ')}
                </span>
              </div>

              {/* Passenger */}
              <div className="passenger-info">
                <h4 className="passenger-title">যাত্রী তথ্য</h4>
                <div className="info-row">
                  <span className="info-label">নাম:</span>
                  <span className="info-value">{bookingData.passengerDetails.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ফোন:</span>
                  <span className="info-value">{bookingData.passengerDetails.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">বোর্ডিং:</span>
                  <span className="info-value">{bookingData.passengerDetails.boardingPoint}</span>
                </div>
              </div>

              {/* Price Breakdown - NO VAT */}
              <div className="price-breakdown">
                <h4 className="breakdown-title">মূল্য বিবরণ</h4>
                <div className="price-row">
                  <span className="price-label">
                    টিকেট মূল্য ({bookingData.selectedSeats?.length || 0} × ৳{bookingData.bus?.fare || 0})
                  </span>
                  <span className="price-value">৳{basePrice}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">সার্ভিস চার্জ</span>
                  <span className="price-value free">৳০ (ফ্রি)</span>
                </div>
                <div className="price-row total">
                  <span className="price-label">সর্বমোট</span>
                  <span className="price-value">৳{totalPrice}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button 
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={!paymentMethod || !agreeTerms}
              >
                <span className="btn-icon">💳</span>
                এখনই পেমেন্ট করুন
              </button>

              {/* Security Badge */}
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">১০০% নিরাপদ পেমেন্ট</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>পেমেন্ট প্রসেসিং</h3>
            </div>
            <div className="modal-body">
              {!isProcessing ? (
                <>
                  <div className="payment-icon">
                    {paymentMethods.find(m => m.id === paymentMethod)?.icon}
                  </div>
                  <h4>{paymentMethods.find(m => m.id === paymentMethod)?.name} দিয়ে পেমেন্ট</h4>
                  <p className="payment-amount">৳{totalPrice}</p>
                  <div className="payment-instructions">
                    <p>আপনার {paymentMethods.find(m => m.id === paymentMethod)?.name} অ্যাপ খুলুন</p>
                    <p>পেমেন্ট সম্পূর্ণ করুন</p>
                  </div>
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setShowPaymentModal(false)}>
                      বাতিল
                    </button>
                    <button className="confirm-btn" onClick={processPayment}>
                      পেমেন্ট করেছি
                    </button>
                  </div>
                </>
              ) : (
                <div className="processing-state">
                  <div className="spinner"></div>
                  <p>পেমেন্ট যাচাই করা হচ্ছে...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-payment">
        <div className="container">
          <p>© ২০২৫ Khulna Travels. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentPage;