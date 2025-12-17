import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      const transactionId = searchParams.get('transaction_id') || paymentService.getPendingPayment();
      const paymentID = searchParams.get('paymentID');

      if (paymentID && transactionId) {
        // bKash callback - execute payment
        try {
          const result = await paymentService.executeBkashPayment(paymentID, transactionId);
          if (result.success) {
            // Check final status
            const statusResult = await paymentService.checkPaymentStatus(transactionId);
            if (statusResult.success) {
              setPayment(statusResult.payment);
            }
          }
        } catch (error) {
          console.error('Payment execution error:', error);
        }
      } else if (transactionId) {
        // Check payment status
        try {
          const result = await paymentService.checkPaymentStatus(transactionId);
          if (result.success) {
            setPayment(result.payment);
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }

      // Clear pending payment
      paymentService.clearPendingPayment();
      setLoading(false);
    };

    checkPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="payment-result">
        <div className="result-container">
          <div className="loading-spinner"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result success">
      <div className="result-container">
        <div className="result-icon success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your booking has been confirmed</p>

        {payment && (
          <div className="payment-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <strong>{payment.transaction_id}</strong>
            </div>
            <div className="detail-row">
              <span>Booking ID:</span>
              <strong>{payment.booking_id}</strong>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <strong>৳{payment.amount}</strong>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <strong className="method-badge">{payment.payment_method}</strong>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <strong>{new Date(payment.payment_completed_at).toLocaleString('en-GB')}</strong>
            </div>
          </div>
        )}

        <div className="result-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/customer-dashboard')}
          >
            View My Bookings
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>

        <div className="download-ticket">
          <button className="btn-download">📥 Download Ticket</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;