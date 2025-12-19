import React from 'react';
import './TicketPrint.css';

const TicketPrint = ({ booking }) => {
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

  return (
    <div className="ticket-print">
      {/* Ticket Container */}
      <div className="ticket-container">
        {/* Header */}
        <div className="ticket-header">
          <div className="company-logo">
            <span className="logo-icon">🚌</span>
          </div>
          <div className="company-info">
            <h1>খুলনা ট্রাভেলস</h1>
            <p>KHULNA TRAVELS</p>
            <p className="tagline">আপনার নিরাপদ যাত্রার সঙ্গী</p>
          </div>
          <div className="ticket-type">
            <span className="badge">কাউন্টার টিকেট</span>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Booking Info */}
        <div className="ticket-body">
          <div className="booking-header">
            <div className="booking-id-section">
              <span className="label">Booking ID:</span>
              <span className="value large">{booking.bookingId || booking._id}</span>
            </div>
            <div className="status-section">
              <span className={`status-badge ${booking.status}`}>
                {booking.status === 'confirmed' ? 'নিশ্চিত' : 
                 booking.status === 'pending' ? 'পেন্ডিং' : booking.status}
              </span>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="info-section">
            <h3 className="section-title">যাত্রী তথ্য</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">নাম:</span>
                <span className="value">{booking.customerName}</span>
              </div>
              <div className="info-item">
                <span className="label">ফোন:</span>
                <span className="value">{booking.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="info-section">
            <h3 className="section-title">যাত্রা তথ্য</h3>
            <div className="journey-route">
              <div className="route-point">
                <span className="location-icon">📍</span>
                <div className="location-info">
                  <span className="location-label">যাত্রা শুরু</span>
                  <span className="location-name">{booking.from}</span>
                  {booking.boardingPoint && (
                    <span className="boarding-point">বোর্ডিং: {booking.boardingPoint}</span>
                  )}
                </div>
              </div>
              
              <div className="route-arrow">
                <span>→</span>
              </div>
              
              <div className="route-point">
                <span className="location-icon">📍</span>
                <div className="location-info">
                  <span className="location-label">গন্তব্য</span>
                  <span className="location-name">{booking.to}</span>
                  {booking.droppingPoint && (
                    <span className="dropping-point">ড্রপিং: {booking.droppingPoint}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="label">যাত্রার তারিখ:</span>
                <span className="value">{formatDate(booking.journeyDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">বাস:</span>
                <span className="value">{booking.busName || 'Bus'}</span>
              </div>
            </div>
          </div>

          {/* Seat & Payment */}
          <div className="info-section">
            <h3 className="section-title">আসন ও পেমেন্ট</h3>
            <div className="seat-display">
              <span className="label">আসন নম্বর:</span>
              <div className="seat-numbers">
                {booking.seats && booking.seats.map((seat, index) => (
                  <span key={index} className="seat-badge">{seat}</span>
                ))}
              </div>
            </div>

            <div className="payment-info">
              <div className="payment-row">
                <span className="label">প্রতি আসন:</span>
                <span className="value">
                  ৳{booking.seats && booking.amount ? 
                    Math.round(booking.amount / booking.seats.length) : 
                    booking.amount}
                </span>
              </div>
              <div className="payment-row">
                <span className="label">আসন সংখ্যা:</span>
                <span className="value">{booking.seats ? booking.seats.length : 0}</span>
              </div>
              <div className="payment-row total">
                <span className="label">মোট টাকা:</span>
                <span className="value">৳{booking.amount}</span>
              </div>
              <div className="payment-row">
                <span className="label">পেমেন্ট মেথড:</span>
                <span className="value method">{booking.paymentMethod || 'Cash'}</span>
              </div>
            </div>
          </div>

          {/* Counter Info */}
          <div className="info-section">
            <h3 className="section-title">কাউন্টার তথ্য</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">কাউন্টার:</span>
                <span className="value">{booking.counter || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">বুকিং সময়:</span>
                <span className="value">
                  {formatTime(booking.createdAt || booking.bookingDate || new Date())}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Footer */}
        <div className="ticket-footer">
          <div className="footer-info">
            <p className="contact-info">
              📞 হটলাইন: ০১৭১১-১২৩৪৫৬ | 📧 info@khulnatravels.com
            </p>
            <p className="terms">
              * যাত্রার ২৪ ঘণ্টা আগে টিকেট বাতিল করা যাবে
            </p>
            <p className="terms">
              * টিকেট সংগে রাখুন এবং বাসে উঠার সময় দেখান
            </p>
          </div>
          
          <div className="barcode-section">
            <div className="barcode-placeholder">
              <div className="barcode-lines">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} style={{ height: `${20 + Math.random() * 20}px` }}></span>
                ))}
              </div>
            </div>
            <span className="barcode-number">{booking.bookingId || booking._id}</span>
          </div>
        </div>

        {/* Print Info */}
        <div className="print-info">
          <p>Printed on: {new Date().toLocaleString('bn-BD')}</p>
        </div>
      </div>

      {/* Page Break for Multiple Tickets */}
      <div className="page-break"></div>
    </div>
  );
};

export default TicketPrint;