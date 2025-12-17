import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../services/paymentService';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Support a quick developer "mock" mode: /payment?mock=1 will pre-fill booking data
  const params = new URLSearchParams(location.search);
  const isMock = params.get('mock') === '1' || params.get('mock') === 'true';
  const mockBooking = isMock ? {
    bus: { id: 1, name: 'Khulna Express', busName: 'Khulna Express', from: 'Khulna', to: 'Kuakata', fare: 1200, departureTime: '09:00', arrivalTime: '14:00' },
    selectedSeats: ['A1','A2'],
    passengerDetails: { name: 'Mock User', phone: '01700000000', email: 'mock@example.com' },
    searchData: { from: 'Khulna', to: 'Kuakata', journeyDate: new Date().toISOString().split('T')[0] },
    totalAmount: 2400,
    bookingId: 'MOCK-BK-100'
  } : {};
  const bookingData = location.state || mockBooking;

  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived booking fields (fall back to defaults if page accessed directly)
  const bus = bookingData.bus || {};
  const selectedSeats = bookingData.selectedSeats || [];
  const passengerDetails = bookingData.passengerDetails || {};
  const searchData = bookingData.searchData || {};
  const totalAmount = bookingData.totalAmount || (selectedSeats.length * (bus.fare || 1740)) || 1740;
  const journeyDate = bookingData.journeyDate || searchData.journeyDate || new Date().toISOString().split('T')[0];

  // Payment methods
  const paymentMethods = [
    {
      id: 'bkash',
      name: 'bKash',
      logo: '💳',
      description: 'Pay with bKash mobile wallet',
      enabled: true
    },
    {
      id: 'sslcommerz',
      name: 'Card / Mobile Banking',
      logo: '💳',
      description: 'Pay with Credit/Debit Card or Mobile Banking',
      enabled: true
    },
    {
      id: 'nagad',
      name: 'Nagad',
      logo: '📱',
      description: 'Pay with Nagad mobile wallet',
      enabled: false
    },
    {
      id: 'rocket',
      name: 'Rocket',
      logo: '🚀',
      description: 'Pay with Rocket mobile wallet',
      enabled: false
    }
  ];

  const [apiTestResult, setApiTestResult] = useState(null);

  const testApiConnection = async () => {
    setApiTestResult('Testing...');
    try {
      const res = await paymentService.checkPaymentStatus('TEST_TRANSACTION');
      if (res && res.success) {
        setApiTestResult(`OK — API reachable (via ${res._url || paymentService.getApiBaseUrl()})`);
      } else {
        const tried = res && res._tried ? res._tried.join(', ') : paymentService.getApiBaseUrl();
        setApiTestResult(`Error: ${res && res.message ? res.message : 'no response'} (tried: ${tried})`);
      }
    } catch (err) {
      setApiTestResult(`Network error: ${err.message}`);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    // Basic validation: ensure booking context exists
    if (!bookingData || (!selectedSeats.length && !bookingData.totalAmount)) {
      setError('No booking found. Please select seats and try again.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare payment data using booking context
    const paymentData = {
      amount: totalAmount,
      booking_id: bookingData.bookingId || 'BK' + Date.now(),
      user_id: bookingData.userId || localStorage.getItem('userId') || 'GUEST',
      customer_name: passengerDetails.name || bookingData.customerName || 'Customer',
      customer_phone: passengerDetails.phone || bookingData.customerPhone || '01700000000',
      customer_email: passengerDetails.email || bookingData.customerEmail || 'customer@example.com',
      customer_address: passengerDetails.address || bookingData.customerAddress || 'Dhaka',
      route: `${bus.from || searchData.from || 'Khulna'} to ${bus.to || searchData.to || 'Dhaka'}`,
      journey_date: journeyDate,
      num_of_seats: selectedSeats.length || 1,
      seats: selectedSeats,
      bus: {
        name: bus.busName || bus.name || 'KHULNA TRAVELS',
        departure: bus.departureTime || '',
        arrival: bus.arrivalTime || ''
      }
    };

    try {
      if (selectedMethod === 'bkash') {
        await handleBkashPayment(paymentData);
      } else if (selectedMethod === 'sslcommerz') {
        await handleSSLCommerzPayment(paymentData);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleBkashPayment = async (paymentData) => {
    const result = await paymentService.createBkashPayment(paymentData);

    if (!result || !result.success) {
      const msg = (result && result.message) ? result.message : 'Failed to create bKash payment';
      const tried = result && result._tried ? result._tried.join(', ') : paymentService.getApiBaseUrl && paymentService.getApiBaseUrl();
      setError(`bKash error: ${msg}${tried ? ' (tried: ' + tried + ')' : ''}`);
      setLoading(false);
      return;
    }

    // Save transaction ID for callback
    paymentService.setPendingPayment(result.transaction_id);

    // Store booking snapshot
    localStorage.setItem('pending_booking', JSON.stringify(paymentData));

    // Open bKash payment window
    const paymentWindow = window.open(
      result.bkash_url,
      'bKashPayment',
      'width=800,height=600'
    );

    // Check if window closed
    const checkWindow = setInterval(() => {
      if (paymentWindow && paymentWindow.closed) {
        clearInterval(checkWindow);
        setLoading(false);
        // Redirect to status check page
        navigate('/payment/status?transaction_id=' + result.transaction_id);
      }
    }, 1000);
  };

  const handleSSLCommerzPayment = async (paymentData) => {
    const result = await paymentService.initSSLCommerzPayment(paymentData);

    if (!result || !result.success) {
      const msg = (result && result.message) ? result.message : 'Failed to initialize payment';
      const api = paymentService.getApiBaseUrl && paymentService.getApiBaseUrl();
      setError(`SSLCommerz error: ${msg}${api ? ' (API: ' + api + ')' : ''}`);
      setLoading(false);
      return;
    }

    // Save transaction ID
    paymentService.setPendingPayment(result.transaction_id);
    localStorage.setItem('pending_booking', JSON.stringify(paymentData));

    // Redirect to SSLCommerz payment gateway
    window.location.href = result.gateway_url;
  };

  // If page was opened without booking context, show guidance
  if ((!bookingData || Object.keys(bookingData).length === 0) && selectedSeats.length === 0 && !bookingData.totalAmount) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h2>No booking found</h2>
            <p>Please select seats from a bus to proceed to payment.</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn-back" onClick={() => window.history.back()}>Back to Booking</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2>Select Payment Method</h2>
          <p>Choose your preferred payment option</p>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h3>Booking Summary</h3>

          <div className="summary-row">
            <span>Bus:</span>
            <strong>{bus.busName || bus.name || 'KHULNA TRAVELS'}</strong>
          </div>

          <div className="summary-row">
            <span>Route:</span>
            <strong>{bus.from || searchData.from || 'Khulna'} → {bus.to || searchData.to || 'Dhaka'}</strong>
          </div>

          <div className="summary-row">
            <span>Journey Date:</span>
            <strong>{journeyDate}</strong>
          </div>

          <div className="summary-row">
            <span>Seats:</span>
            <strong>{selectedSeats.length ? selectedSeats.join(', ') : '—'}</strong>
          </div>

          <div className="summary-row">
            <span>Passenger:</span>
            <strong>{passengerDetails.name || '—'} ({passengerDetails.phone || '—'})</strong>
          </div>

          <div className="summary-row total">
            <span>Total Amount:</span>
            <strong>৳{totalAmount}</strong>
          </div>
          <div className="summary-row">
            <span>API:</span>
            <strong style={{fontSize: '12px', color: '#666'}}>{paymentService.getApiBaseUrl()}</strong>
            <button style={{marginLeft: 12, padding: '6px 8px', fontSize: 12}} onClick={testApiConnection} type="button">Test API</button>
          </div>

          {apiTestResult && (
            <div className="summary-row" style={{marginTop: 6}}>
              <span>API status:</span>
              <strong style={{fontSize: 12, color: apiTestResult.startsWith('OK') ? '#2cb67d' : '#d63031'}}>{apiTestResult}</strong>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`payment-method ${selectedMethod === method.id ? 'selected' : ''} ${!method.enabled ? 'disabled' : ''}`}
              onClick={() => method.enabled && setSelectedMethod(method.id)}
            >
              <div className="method-logo">{method.logo}</div>
              <div className="method-info">
                <h4>{method.name}</h4>
                <p>{method.description}</p>
                {!method.enabled && <span className="coming-soon">Coming Soon</span>}
              </div>
              {selectedMethod === method.id && <div className="checkmark">✓</div>}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-actions">
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back
          </button>
          <button
            className="btn-pay"
            onClick={handlePayment}
            disabled={!selectedMethod || loading || (!selectedSeats.length && !bookingData.totalAmount) || (!passengerDetails.phone && !bookingData.customerPhone)}
          >
            {loading ? 'Processing...' : `Pay ৳${totalAmount}`}
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <span className="lock-icon">🔒</span>
          <p>Your payment is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
