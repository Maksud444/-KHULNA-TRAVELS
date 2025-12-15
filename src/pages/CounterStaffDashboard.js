import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CounterStaffDashboard.css';

const CounterStaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new-booking');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Counter staff info
  const [staffInfo, setStaffInfo] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'STAFF001';
    
    fetch('/admin-staff-customer-data.json')
      .then(res => res.json())
      .then(jsonData => {
        const staff = jsonData.counterStaff.find(s => s.userId === userId);
        setStaffInfo(staff);
        setData(jsonData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/');
  };

  if (loading || !data || !staffInfo) {
    return <div className="staff-loading">Loading...</div>;
  }

  // Today's stats (sample)
  const todayStats = {
    bookings: 12,
    tickets: 8,
    revenue: 18750,
    pending: 3
  };

  return (
    <div className="counter-staff-dashboard">
      {/* Header */}
      <header className="staff-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Counter Staff Dashboard</h1>
            <p className="counter-location">📍 {staffInfo.counterLocation}</p>
          </div>
          <div className="header-right">
            <div className="staff-profile">
              <span className="staff-name">{staffInfo.name}</span>
              <span className="staff-shift">{staffInfo.shift}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Today's Stats */}
      <div className="staff-container">
        <div className="today-stats">
          <div className="stat-box green">
            <div className="stat-icon">📝</div>
            <div className="stat-details">
              <h3>আজকের বুকিং</h3>
              <p className="stat-value">{todayStats.bookings}</p>
            </div>
          </div>

          <div className="stat-box blue">
            <div className="stat-icon">🎫</div>
            <div className="stat-details">
              <h3>টিকেট ইস্যু</h3>
              <p className="stat-value">{todayStats.tickets}</p>
            </div>
          </div>

          <div className="stat-box purple">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>আজকের রেভিনিউ</h3>
              <p className="stat-value">৳{todayStats.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-box orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <h3>পেন্ডিং</h3>
              <p className="stat-value">{todayStats.pending}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="staff-main">
          {/* Tabs */}
          <div className="staff-tabs">
            <button 
              className={`staff-tab ${activeTab === 'new-booking' ? 'active' : ''}`}
              onClick={() => setActiveTab('new-booking')}
            >
              <span className="tab-icon">➕</span>
              New Booking
            </button>
            <button 
              className={`staff-tab ${activeTab === 'my-bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-bookings')}
            >
              <span className="tab-icon">📋</span>
              My Bookings
            </button>
            <button 
              className={`staff-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <span className="tab-icon">🔍</span>
              Search Booking
            </button>
            <button 
              className={`staff-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <span className="tab-icon">💳</span>
              Payments
            </button>
          </div>

          {/* New Booking Tab */}
          {activeTab === 'new-booking' && (
            <div className="tab-panel">
              <h2 className="panel-title">নতুন বুকিং তৈরি করুন</h2>
              
              <div className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>যাত্রীর নাম *</label>
                    <input type="text" placeholder="নাম লিখুন" />
                  </div>
                  <div className="form-group">
                    <label>মোবাইল নম্বর *</label>
                    <input type="tel" placeholder="০১৭১২৩৪৫৬৭৮" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>From *</label>
                    <select>
                      <option value="">Select Location</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Jessore">Jessore</option>
                      <option value="Dhaka">Dhaka</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To *</label>
                    <select>
                      <option value="">Select Destination</option>
                      <option value="Kuakata">Kuakata</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Jessore">Jessore</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>যাত্রার তারিখ *</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>বাস সিলেক্ট করুন *</label>
                    <select>
                      <option value="">Select Bus</option>
                      <option value="BUS001">KHULNA TRAVELS - 01 (AC)</option>
                      <option value="BUS002">KHULNA TRAVELS - 02 (Non-AC)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>সিট নম্বর *</label>
                  <input type="text" placeholder="A1, A2, B3" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Boarding Point *</label>
                    <select>
                      <option value="">Select Point</option>
                      <option value="Khulna Zero Point">Khulna Zero Point</option>
                      <option value="Khulna Sonadanga">Khulna Sonadanga</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Dropping Point *</label>
                    <select>
                      <option value="">Select Point</option>
                      <option value="Kuakata">Kuakata Bus Stand</option>
                      <option value="Patuakhali">Patuakhali</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fare (per seat) *</label>
                    <input type="number" placeholder="870" />
                  </div>
                  <div className="form-group">
                    <label>Total Amount</label>
                    <input type="number" placeholder="Calculated automatically" disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select>
                    <option value="">Select Method</option>
                    <option value="cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button className="submit-btn">Create Booking</button>
                  <button className="reset-btn">Reset Form</button>
                </div>
              </div>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <div className="tab-panel">
              <h2 className="panel-title">আমার আজকের বুকিং</h2>
              
              <div className="bookings-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Route</th>
                      <th>Date</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings
                      .filter(b => b.bookedBy === staffInfo.userId)
                      .map(booking => (
                        <tr key={booking.bookingId}>
                          <td className="booking-id">{booking.bookingId}</td>
                          <td>{booking.customerName}</td>
                          <td>{booking.from} → {booking.to}</td>
                          <td>{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</td>
                          <td>{booking.seats.join(', ')}</td>
                          <td className="amount">৳{booking.amount}</td>
                          <td>{booking.bookingTime}</td>
                          <td>
                            <button className="view-btn">View</button>
                            <button className="print-btn">Print</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Search & Payments placeholders */}
          {(activeTab === 'search' || activeTab === 'payments') && (
            <div className="tab-panel">
              <h2 className="panel-title">
                {activeTab === 'search' ? 'Search Booking' : 'Payment Management'}
              </h2>
              <p className="coming-soon">This feature is coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterStaffDashboard;