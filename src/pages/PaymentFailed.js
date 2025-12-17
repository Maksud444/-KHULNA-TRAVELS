import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentResult.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="payment-result failed">
      <div className="result-container">
        <div className="result-icon failed-icon">✗</div>
        <h2>Payment Failed</h2>
        <p>Unfortunately, your payment could not be processed</p>

        {transactionId && (
          <div className="payment-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <strong>{transactionId}</strong>
            </div>
          </div>
        )}

        <div className="failure-reasons">
          <h3>Common reasons for payment failure:</h3>
          <ul>
            <li>Insufficient balance in your account</li>
            <li>Incorrect PIN or password entered</li>
            <li>Payment timeout</li>
            <li>Network connectivity issues</li>
          </ul>
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

        <div className="support-info">
          <p>Need help? Contact our support team</p>
          <a href="tel:01700000000">📞 01700-000000</a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;