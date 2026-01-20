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
              <p className="company-tagline">Your trusted travel companion</p>
            </div>
          </div>
          <div className="ticket-badge">
            <span className="badge-text">E-Ticket</span>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Booking Reference */}
        <div className="booking-reference">
          <div className="reference-left">
            <span className="reference-label">Booking ID:</span>
            <span className="reference-value">{booking.bookingId || booking._id}</span>
          </div>
          <div className="reference-right">
            <span className="booking-badge confirmed">Confirmed</span>
          </div>
        </div>

        {/* Journey Route */}
        <div className="journey-section">
          <h2 className="section-heading">Journey Route</h2>
          <div className="journey-route">
            <div className="journey-point origin">
              <span className="point-icon">📍</span>
              <div className="point-details">
                <h3 className="point-name">{booking.from}</h3>
                <p className="point-label">Journey Start</p>
                {booking.boardingPoint && (
                  <p className="boarding-info">Boarding Point: {booking.boardingPoint}</p>
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
                <p className="point-label">Destination</p>
                {booking.droppingPoint && (
                  <p className="dropping-info">Dropping Point: {booking.droppingPoint}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Passenger Details */}
        <div className="passenger-section">
          <h2 className="section-heading">Passenger Information</h2>
          <div className="passenger-grid">
            <div className="passenger-item">
              <span className="item-label">Name:</span>
              <span className="item-value">{booking.customerName || 'Passenger'}</span>
            </div>
            {booking.customerPhone && (
              <div className="passenger-item">
                <span className="item-label">Phone:</span>
                <span className="item-value">{booking.customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Journey Details */}
        <div className="details-section">
          <h2 className="section-heading">Journey Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="item-label">Journey Date:</span>
              <span className="item-value">{formatDate(booking.journeyDate)}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Bus Name:</span>
              <span className="item-value">{getBusName(booking)}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Operator:</span>
              <span className="item-value">{getOperator(booking)}</span>
            </div>
            {booking.busNumber && (
              <div className="detail-item">
                <span className="item-label">Bus Number:</span>
                <span className="item-value">{booking.busNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ticket-divider"></div>

        {/* Seat & Payment */}
        <div className="seat-payment-section">
          <div className="seat-info">
            <h2 className="section-heading">Seat Information</h2>
            <div className="seat-display">
              {booking.seats && booking.seats.map((seat, index) => (
                <span key={index} className="seat-number">{seat}</span>
              ))}
            </div>
            <p className="seat-count">
              Total Seats: {booking.seats ? booking.seats.length : 0}
            </p>
          </div>

          <div className="payment-info">
            <h2 className="section-heading">Payment Information</h2>
            <div className="payment-details">
              <div className="payment-row">
                <span className="payment-label">Per Seat:</span>
                <span className="payment-value">
                  ৳{booking.seats && booking.amount ? 
                    Math.round(booking.amount / booking.seats.length) : 
                    booking.amount}
                </span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Number of Seats:</span>
                <span className="payment-value">
                  {booking.seats ? booking.seats.length : 0}
                </span>
              </div>
              <div className="payment-row total-row">
                <span className="payment-label">Total Amount:</span>
                <span className="payment-value total-amount">৳{booking.amount}</span>
              </div>
              {booking.paymentMethod && (
                <div className="payment-row">
                  <span className="payment-label">Payment Method:</span>
                  <span className="payment-value method">
                    {booking.paymentMethod}
                  </span>
                </div>
              )}
              {booking.paymentStatus && (
                <div className="payment-row">
                  <span className="payment-label">Payment Status:</span>
                  <span className={`payment-value status ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 
                     booking.paymentStatus === 'pending' ? 'Pending' : 
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
          <h2 className="section-heading">Important Instructions</h2>
          <ul className="instructions-list">
            <li>✓ Keep this ticket with you during travel</li>
            <li>✓ Show ticket and ID when boarding the bus</li>
            <li>✓ Arrive at boarding point at least 30 minutes before departure</li>
            <li>✓ Get full refund if cancelled 24 hours before journey</li>
            <li>✓ Contact our hotline for any issues</li>
          </ul>
        </div>

        <div className="ticket-divider"></div>

        {/* Footer */}
        <div className="ticket-footer">
          <div className="footer-contact">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span className="contact-text">Hotline: 01711-123456</span>
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
            <p>Print Time: {new Date().toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <p>🔒 This ticket is digitally verified and secure</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerTicketPrint;