import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import './PaymentPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentStatus = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const transactionId = query.get('transaction_id');

  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!transactionId) {
      setError('No transaction id provided');
      setLoading(false);
      return;
    }

    let mounted = true;

    const poll = async () => {
      const start = Date.now();
      while (mounted && Date.now() - start < 60000) {
        try {
          const res = await paymentService.checkPaymentStatus(transactionId);
          const s = res?.status || 'PENDING';
          setStatus(s);
          if (s === 'SUCCESS') {
            const pendingBooking = localStorage.getItem('pending_booking');
            let booking = pendingBooking ? JSON.parse(pendingBooking) : {};
            paymentService.clearPendingPayment();
            localStorage.removeItem('pending_booking');
            navigate('/confirmation', { state: { bookingId: transactionId, paymentStatus: 'SUCCESS', ...booking } });
            return;
          }
          if (s === 'FAILED') {
            setError('Payment failed. Please try again.');
            setLoading(false);
            return;
          }
        } catch (err) {
          setError('Unable to check payment status');
          setLoading(false);
          return;
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (mounted) {
        setError('Payment timed out. Please check later.');
        setLoading(false);
      }
    };

    poll();

    return () => { mounted = false; };
  }, [transactionId, navigate]);

  return (
    <div className="payment-status-page">
      <div className="payment-container">
        <h2>Payment Status</h2>
        {loading && <p>Checking status for <strong>{transactionId}</strong>...</p>}
        {!loading && error && <div className="error-message">{error}</div>}
        {!loading && !error && <div>Current status: {status}</div>}
        <div style={{ marginTop: 20 }}>
          <button className="btn-back" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
