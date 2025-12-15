import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // For testing: Load user from localStorage or use default
  useEffect(() => {
    const loadUserData = () => {
      // Get logged in user ID from localStorage
      const loggedInUserId = localStorage.getItem('userId') || 'USER001';
      
      // In production, fetch from API: /api/users/${loggedInUserId}
      // For now, using test data
      fetch('/users-test-data.json')
        .then(res => res.json())
        .then(data => {
          const user = data.users.find(u => u.userId === loggedInUserId);
          if (user) {
            setUserData(user);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading user data:', error);
          setLoading(false);
        });
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('আপনি কি এই বুকিং বাতিল করতে চান?')) {
      // In production: API call to cancel booking
      alert(`বুকিং ${bookingId} বাতিল করা হয়েছে`);
    }
  };

  const handlePrintTicket = (booking) => {
    // In production: Generate PDF ticket
    window.print();
  };

  const handleDownloadTicket = (booking) => {
    // In production: Download PDF ticket
    alert(`টিকেট ডাউনলোড হচ্ছে: ${booking.bookingId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="dashboard-error">
        <h2>User not found</h2>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  const upcomingBookings = userData.bookings.filter(b => b.status === 'upcoming');
  const completedBookings = userData.bookings.filter(b => b.status === 'completed');
  const cancelledBookings = userData.bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1 className="dashboard-title">আমার ড্যাশবোর্ড</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Sidebar - User Profile */}
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {userData.name.charAt(0)}
              </div>
              <h2 className="profile-name">{userData.name}</h2>
              <p className="profile-email">{userData.email}</p>
              <p className="profile-phone">{userData.phone}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">মোট বুকিং</span>
                  <span className="stat-value">{userData.totalBookings}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">সদস্য হয়েছেন</span>
                  <span className="stat-value">{new Date(userData.joinDate).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
              <button className="edit-profile-btn">প্রোফাইল এডিট করুন</button>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat-item upcoming">
                <span className="quick-stat-number">{upcomingBookings.length}</span>
                <span className="quick-stat-label">আসন্ন ট্রিপ</span>
              </div>
              <div className="quick-stat-item completed">
                <span className="quick-stat-number">{completedBookings.length}</span>
                <span className="quick-stat-label">সম্পন্ন ট্রিপ</span>
              </div>
              <div className="quick-stat-item cancelled">
                <span className="quick-stat-number">{cancelledBookings.length}</span>
                <span className="quick-stat-label">বাতিল</span>
              </div>
            </div>
          </aside>

          {/* Main Content - Bookings */}
          <main className="dashboard-main">
            {/* Tabs */}
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                আসন্ন ট্রিপ ({upcomingBookings.length})
              </button>
              <button 
                className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                সম্পন্ন ট্রিপ ({completedBookings.length})
              </button>
              <button 
                className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                বাতিল ট্রিপ ({cancelledBookings.length})
              </button>
            </div>

            {/* Upcoming Bookings */}
            {activeTab === 'upcoming' && (
              <div className="bookings-list">
                {upcomingBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>কোন আসন্ন ট্রিপ নেই</p>
                    <button className="book-now-btn" onClick={() => navigate('/')}>
                      এখনই বুক করুন
                    </button>
                  </div>
                ) : (
                  upcomingBookings.map(booking => (
                    <div key={booking.bookingId} className="booking-card upcoming">
                      <div className="booking-header">
                        <div className="booking-id">
                          <span className="label">বুকিং আইডি:</span>
                          <span className="value">{booking.bookingId}</span>
                        </div>
                        <span className="booking-status upcoming">আসন্ন</span>
                      </div>

                      <div className="booking-body">
                        <div className="booking-route">
                          <div className="route-point">
                            <h3>{booking.from}</h3>
                            <p className="boarding-point">{booking.boardingPoint}</p>
                            <p className="time">{booking.departureTime}</p>
                          </div>
                          <div className="route-arrow">
                            <div className="arrow-line"></div>
                            <span className="bus-icon">🚌</span>
                          </div>
                          <div className="route-point">
                            <h3>{booking.to}</h3>
                            <p className="dropping-point">{booking.droppingPoint}</p>
                            <p className="time">{booking.arrivalTime}</p>
                          </div>
                        </div>

                        <div className="booking-details">
                          <div className="detail-row">
                            <span className="detail-label">যাত্রার তারিখ:</span>
                            <span className="detail-value">{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">বাস:</span>
                            <span className="detail-value">{booking.busName}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">অপারেটর:</span>
                            <span className="detail-value">{booking.operator}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">সিট নম্বর:</span>
                            <span className="detail-value seats">{booking.seats.join(', ')}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">পেমেন্ট:</span>
                            <span className="detail-value">{booking.paymentMethod}</span>
                          </div>
                          <div className="detail-row total">
                            <span className="detail-label">মোট পরিমাণ:</span>
                            <span className="detail-value">৳{booking.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="booking-actions">
                        <button 
                          className="action-btn print"
                          onClick={() => handlePrintTicket(booking)}
                        >
                          <span className="icon">🖨️</span>
                          প্রিন্ট টিকেট
                        </button>
                        <button 
                          className="action-btn download"
                          onClick={() => handleDownloadTicket(booking)}
                        >
                          <span className="icon">⬇️</span>
                          ডাউনলোড
                        </button>
                        <button 
                          className="action-btn cancel"
                          onClick={() => handleCancelBooking(booking.bookingId)}
                        >
                          <span className="icon">✕</span>
                          বাতিল করুন
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Completed Bookings */}
            {activeTab === 'completed' && (
              <div className="bookings-list">
                {completedBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>কোন সম্পন্ন ট্রিপ নেই</p>
                  </div>
                ) : (
                  completedBookings.map(booking => (
                    <div key={booking.bookingId} className="booking-card completed">
                      <div className="booking-header">
                        <div className="booking-id">
                          <span className="label">বুকিং আইডি:</span>
                          <span className="value">{booking.bookingId}</span>
                        </div>
                        <span className="booking-status completed">সম্পন্ন</span>
                      </div>

                      <div className="booking-body">
                        <div className="booking-route">
                          <div className="route-point">
                            <h3>{booking.from}</h3>
                            <p className="time">{booking.departureTime}</p>
                          </div>
                          <div className="route-arrow">
                            <div className="arrow-line"></div>
                            <span className="bus-icon">🚌</span>
                          </div>
                          <div className="route-point">
                            <h3>{booking.to}</h3>
                            <p className="time">{booking.arrivalTime}</p>
                          </div>
                        </div>

                        <div className="booking-details">
                          <div className="detail-row">
                            <span className="detail-label">যাত্রার তারিখ:</span>
                            <span className="detail-value">{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">সিট:</span>
                            <span className="detail-value">{booking.seats.join(', ')}</span>
                          </div>
                          <div className="detail-row total">
                            <span className="detail-label">মোট:</span>
                            <span className="detail-value">৳{booking.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="booking-actions">
                        <button 
                          className="action-btn download"
                          onClick={() => handleDownloadTicket(booking)}
                        >
                          <span className="icon">⬇️</span>
                          টিকেট ডাউনলোড
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Cancelled Bookings */}
            {activeTab === 'cancelled' && (
              <div className="bookings-list">
                {cancelledBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>কোন বাতিল ট্রিপ নেই</p>
                  </div>
                ) : (
                  cancelledBookings.map(booking => (
                    <div key={booking.bookingId} className="booking-card cancelled">
                      <div className="booking-header">
                        <div className="booking-id">
                          <span className="label">বুকিং আইডি:</span>
                          <span className="value">{booking.bookingId}</span>
                        </div>
                        <span className="booking-status cancelled">বাতিল</span>
                      </div>

                      <div className="booking-body">
                        <div className="booking-route">
                          <div className="route-point">
                            <h3>{booking.from}</h3>
                            <p className="time">{booking.departureTime}</p>
                          </div>
                          <div className="route-arrow">
                            <div className="arrow-line"></div>
                            <span className="bus-icon">🚌</span>
                          </div>
                          <div className="route-point">
                            <h3>{booking.to}</h3>
                            <p className="time">{booking.arrivalTime}</p>
                          </div>
                        </div>

                        <div className="booking-details">
                          <div className="detail-row">
                            <span className="detail-label">বাতিল তারিখ:</span>
                            <span className="detail-value">{new Date(booking.cancelDate).toLocaleDateString('bn-BD')}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">রিফান্ড:</span>
                            <span className="detail-value refund">৳{booking.refundAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;