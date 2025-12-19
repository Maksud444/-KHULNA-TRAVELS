import React from 'react';
import './Customerticketprint.css';

const CustomerTicketPrint = ({ booking }) => {
  if (!booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBusName = (booking) => {
    return booking.busName || booking.bus?.name || 'Khulna Travels Bus';
  };

  const getOperator = (booking) => {
    return booking.operator || 'Khulna Travels';
  };

  return (
    <div className="customer-ticket-print">
      <div className="ticket-wrapper">
        {/* Header Section */}
        <div className="ticket-header">
          <div className="company-branding">
            <div className="company-logo">
              <span className="logo-icon">🚌</span>
            </div>
            <div className="company-details">
              <h1 className="company-name">খুলনা ট্রাভেলস</h1>
              <p className="company-name-en">KHULNA TRAVELS</p>
              <p className="company-tagline">আপনার বিশ্বস্ত যাত্রার সঙ্গী</p>
            </div>
          </div>
          <div className="ticket-badge">
            <span className="badge-text">ই-টিকেট</span>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Booking Reference */}
        <div className="booking-reference">
          <div className="reference-left">
            <span className="reference-label">বুকিং আইডি:</span>
            <span className="reference-value">{booking.bookingId || booking._id}</span>
          </div>
          <div className="reference-right">
            <span className="booking-badge confirmed">নিশ্চিত</span>
          </div>
        </div>

        {/* Journey Route */}
        <div className="journey-section">
          <h2 className="section-heading">যাত্রা পথ</h2>
          <div className="journey-route">
            <div className="journey-point origin">
              <span className="point-icon">📍</span>
              <div className="point-details">
                <h3 className="point-name">{booking.from}</h3>
                <p className="point-label">যাত্রা শুরু</p>
                {booking.boardingPoint && (
                  <p className="boarding-info">উঠার স্থান: {booking.boardingPoint}</p>
                )}
              </div>
            </div>

            <div className="journey-connector">
              <div className="connector-line"></div>
              <span className="connector-icon">🚌</span>
              <div className="connector-line"></div>
            </div>

            <div className="journey-point destination">
              <span className="point-icon">📍</span>
              <div className="point-details">
                <h3 className="point-name">{booking.to}</h3>
                <p className="point-label">গন্তব্য</p>
                {booking.droppingPoint && (
                  <p className="dropping-info">নামার স্থান: {booking.droppingPoint}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Passenger Details */}
        <div className="passenger-section">
          <h2 className="section-heading">যাত্রী তথ্য</h2>
          <div className="passenger-grid">
            <div className="passenger-item">
              <span className="item-label">নাম:</span>
              <span className="item-value">{booking.customerName || 'যাত্রী'}</span>
            </div>
            {booking.customerPhone && (
              <div className="passenger-item">
                <span className="item-label">ফোন:</span>
                <span className="item-value">{booking.customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Journey Details */}
        <div className="details-section">
          <h2 className="section-heading">যাত্রা বিবরণ</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="item-label">যাত্রার তারিখ:</span>
              <span className="item-value">{formatDate(booking.journeyDate)}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">বাস নাম:</span>
              <span className="item-value">{getBusName(booking)}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">অপারেটর:</span>
              <span className="item-value">{getOperator(booking)}</span>
            </div>
            {booking.busNumber && (
              <div className="detail-item">
                <span className="item-label">বাস নম্বর:</span>
                <span className="item-value">{booking.busNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Seat & Payment */}
        <div className="seat-payment-section">
          <div className="seat-info">
            <h2 className="section-heading">আসন তথ্য</h2>
            <div className="seat-display">
              {booking.seats && booking.seats.map((seat, index) => (
                <span key={index} className="seat-number">{seat}</span>
              ))}
            </div>
            <p className="seat-count">
              মোট আসন: {booking.seats ? booking.seats.length : 0}
            </p>
          </div>

          <div className="payment-info">
            <h2 className="section-heading">পেমেন্ট তথ্য</h2>
            <div className="payment-details">
              <div className="payment-row">
                <span className="payment-label">প্রতি আসন:</span>
                <span className="payment-value">
                  ৳{booking.seats && booking.amount ? 
                    Math.round(booking.amount / booking.seats.length) : 
                    booking.amount}
                </span>
              </div>
              <div className="payment-row">
                <span className="payment-label">আসন সংখ্যা:</span>
                <span className="payment-value">
                  {booking.seats ? booking.seats.length : 0}
                </span>
              </div>
              <div className="payment-row total-row">
                <span className="payment-label">মোট পরিমাণ:</span>
                <span className="payment-value total-amount">৳{booking.amount}</span>
              </div>
              {booking.paymentMethod && (
                <div className="payment-row">
                  <span className="payment-label">পেমেন্ট মেথড:</span>
                  <span className="payment-value method">
                    {booking.paymentMethod}
                  </span>
                </div>
              )}
              {booking.paymentStatus && (
                <div className="payment-row">
                  <span className="payment-label">পেমেন্ট স্ট্যাটাস:</span>
                  <span className={`payment-value status ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'paid' ? 'পরিশোধিত' : 
                     booking.paymentStatus === 'pending' ? 'পেন্ডিং' : 
                     booking.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Important Instructions */}
        <div className="instructions-section">
          <h2 className="section-heading">গুরুত্বপূর্ণ নির্দেশনা</h2>
          <ul className="instructions-list">
            <li>✓ যাত্রার সময় এই টিকেট অবশ্যই সাথে রাখুন</li>
            <li>✓ বাসে উঠার সময় টিকেট এবং পরিচয়পত্র দেখান</li>
            <li>✓ যাত্রা শুরুর অন্তত ৩০ মিনিট আগে বোর্ডিং পয়েন্টে পৌঁছান</li>
            <li>✓ যাত্রার ২৪ ঘণ্টা আগে বাতিল করলে সম্পূর্ণ রিফান্ড পাবেন</li>
            <li>✓ যেকোনো সমস্যার জন্য আমাদের হটলাইনে যোগাযোগ করুন</li>
          </ul>
        </div>

        <div className="ticket-divider"></div>

        {/* Footer */}
        <div className="ticket-footer">
          <div className="footer-contact">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span className="contact-text">হটলাইন: ০১৭১১-১২৩৪৫৬</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span className="contact-text">info@khulnatravels.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <span className="contact-text">www.khulnatravels.com</span>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="barcode-section">
            <div className="barcode-placeholder">
              <div className="barcode-lines">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      height: `${15 + Math.random() * 25}px`,
                      opacity: 0.8 + Math.random() * 0.2
                    }}
                  ></span>
                ))}
              </div>
            </div>
            <div className="barcode-text">{booking.bookingId || booking._id}</div>
          </div>

          {/* Print Timestamp */}
          <div className="print-timestamp">
            <p>প্রিন্ট করার সময়: {new Date().toLocaleString('bn-BD')}</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <p>🔒 এই টিকেট ডিজিটালি যাচাইকৃত এবং সুরক্ষিত</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerTicketPrint;