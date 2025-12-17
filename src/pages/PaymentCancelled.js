import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentResult.css';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-result cancelled">
      <div className="result-container">
        <div className="result-icon cancelled-icon">⚠</div>
        <h2>Payment Cancelled</h2>
        <p>You have cancelled the payment process</p>

        <div className="cancelled-message">
          <p>Your booking has not been confirmed yet.</p>
          <p>If this was a mistake, you can try again.</p>
        </div>

        <div className="result-actions">
          <button
            className="btn-primary"
            onClick={() => navigate(-1)}
          >
            Try Again
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
