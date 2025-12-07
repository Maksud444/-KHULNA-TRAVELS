import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Confirmationpage.css';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const bookingData = location.state || {
    bookingId: 'KT' + Date.now(),
    bus: { name: 'KHULNA TRAVELS', type: 'NON AC', fare: 950 },
    selectedSeats: ['A1', 'A2'],
    passengerDetails: { name: 'যাত্রী নাম', phone: '01700000000', boardingPoint: 'Apil Gate' },
    searchData: { from: 'Khulna', to: 'Kuakata', journeyDate: new Date().toISOString().split('T')[0] },
    paymentMethod: 'bkash',
    totalPrice: 1900,
    paymentStatus: 'SUCCESS'
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger success animation
    setTimeout(() => setShowSuccess(true), 100);
    setTimeout(() => setShowConfetti(true), 500);
    
    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3500);
  }, []);

  const handleDownloadTicket = () => {
    alert('টিকেট ডাউনলোড ফিচার শীঘ্রই আসছে!');
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="confirmation-page">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}

      <div className="confirmation-container">
        {/* Success Animation Card */}
        <div className={`success-card ${showSuccess ? 'show' : ''}`}>
          {/* Animated Checkmark */}
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-checkmark">
                <svg className="checkmark-svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <h1 className="success-title animate-fade-in">🎉 অভিনন্দন! 🎉</h1>
            <h2 className="success-subtitle animate-fade-in-delay">আপনার বুকিং সফল হয়েছে!</h2>
            <p className="success-description animate-fade-in-delay-2">
              টিকেট আপনার মোবাইল নম্বরে SMS এ পাঠানো হয়েছে
            </p>
          </div>

          {/* Booking ID Badge */}
          <div className="booking-id-badge animate-slide-up">
            <span className="badge-label">বুকিং আইডি</span>
            <span className="badge-value">{bookingData.bookingId}</span>
          </div>
        </div>

        {/* Ticket Details Card */}
        <div className="ticket-card animate-slide-up-delay">
          <div className="ticket-header">
            <div className="ticket-logo">
              <span className="logo-icon">🚌</span>
              <span className="logo-text">KHULNA TRAVELS</span>
            </div>
            <div className="ticket-status success">
              <span className="status-icon">✓</span>
              <span className="status-text">কনফার্মড</span>
            </div>
          </div>

          <div className="ticket-body">
            {/* Journey Route */}
            <div className="journey-display">
              <div className="journey-point">
                <div className="point-icon">📍</div>
                <div className="point-info">
                  <div className="point-label">শুরু</div>
                  <div className="point-name">{bookingData.searchData.from}</div>
                </div>
              </div>
              <div className="journey-line">
                <div className="journey-bus">🚌</div>
              </div>
              <div className="journey-point">
                <div className="point-icon">🏁</div>
                <div className="point-info">
                  <div className="point-label">গন্তব্য</div>
                  <div className="point-name">{bookingData.searchData.to}</div>
                </div>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="ticket-details-grid">
              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div className="detail-info">
                  <div className="detail-label">যাত্রার তারিখ</div>
                  <div className="detail-value">
                    {new Date(bookingData.searchData.journeyDate).toLocaleDateString('bn-BD', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🚌</div>
                <div className="detail-info">
                  <div className="detail-label">বাসের ধরন</div>
                  <div className="detail-value">{bookingData.bus.type}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">💺</div>
                <div className="detail-info">
                  <div className="detail-label">আসন নম্বর</div>
                  <div className="detail-value seats">
                    {bookingData.selectedSeats.map((seat, idx) => (
                      <span key={idx} className="seat-badge">{seat}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-info">
                  <div className="detail-label">যাত্রীর নাম</div>
                  <div className="detail-value">{bookingData.passengerDetails.name}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📱</div>
                <div className="detail-info">
                  <div className="detail-label">মোবাইল নম্বর</div>
                  <div className="detail-value">{bookingData.passengerDetails.phone}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📍</div>
                <div className="detail-info">
                  <div className="detail-label">বোর্ডিং পয়েন্ট</div>
                  <div className="detail-value">{bookingData.passengerDetails.boardingPoint}</div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="payment-info-section">
              <div className="payment-info-header">
                <span className="payment-icon">💳</span>
                <span className="payment-title">পেমেন্ট তথ্য</span>
              </div>
              <div className="payment-details">
                <div className="payment-row">
                  <span className="payment-label">পেমেন্ট মেথড:</span>
                  <span className="payment-value">{bookingData.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="payment-row">
                  <span className="payment-label">স্ট্যাটাস:</span>
                  <span className="payment-value success">✓ সফল</span>
                </div>
                <div className="payment-row total">
                  <span className="payment-label">মোট পরিশোধিত:</span>
                  <span className="payment-value">৳{bookingData.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="qr-section">
            <div className="qr-code">
              <div className="qr-placeholder">
                <div className="qr-pattern">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="qr-cell"></div>
                  ))}
                </div>
              </div>
            </div>
            <p className="qr-instruction">
              বাসে উঠার সময় এই QR কোড স্ক্যান করান
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons animate-slide-up-delay-2">
          <button className="btn btn-primary" onClick={handleDownloadTicket}>
            <span className="btn-icon">📥</span>
            টিকেট ডাউনলোড করুন
          </button>
          <button className="btn btn-secondary" onClick={handlePrintTicket}>
            <span className="btn-icon">🖨️</span>
            প্রিন্ট করুন
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            <span className="btn-icon">🏠</span>
            হোম পেজে ফিরুন
          </button>
        </div>

        {/* Important Notes */}
        <div className="important-notes animate-fade-in-final">
          <h3 className="notes-title">⚠️ গুরুত্বপূর্ণ নির্দেশনা</h3>
          <ul className="notes-list">
            <li>যাত্রার ৩০ মিনিট আগে বোর্ডিং পয়েন্টে পৌঁছান</li>
            <li>সাথে বৈধ পরিচয়পত্র এবং টিকেট রাখুন</li>
            <li>টিকেট বাতিল করতে যাত্রার ২৪ ঘন্টা আগে যোগাযোগ করুন</li>
            <li>হেল্পলাইন: 01700-000000</li>
          </ul>
        </div>

        {/* Thank You Message */}
        <div className="thank-you-section animate-fade-in-final">
          <div className="thank-you-icon">🙏</div>
          <h3 className="thank-you-title">ধন্যবাদ!</h3>
          <p className="thank-you-message">
            খুলনা ট্রাভেলস এ আপনার বুকিংয়ের জন্য ধন্যবাদ।<br />
            আমরা আপনাকে নিরাপদ ও আরামদায়ক যাত্রা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।
          </p>
          <div className="social-share">
            <p>শেয়ার করুন:</p>
            <div className="share-buttons">
              <button className="share-btn facebook">📘</button>
              <button className="share-btn whatsapp">💬</button>
              <button className="share-btn messenger">💬</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;