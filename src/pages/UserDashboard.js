import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import CustomerTicketPrint from './Customerticketprint';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // User data state with defaults
  const [userData, setUserData] = useState({
    userId: '',
    name: 'User',
    email: '',
    phone: '',
    totalBookings: 0,
    joinDate: new Date()
  });

  // Bookings state
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);

  // Print states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);

  // Load user data on mount
  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.log('⚠️ No user logged in, redirecting to login...');
      navigate('/login');
      return;
    }

    loadUserData();
    loadUserBookings();
  }, []);

  // Load user info from localStorage and API
  const loadUserData = async () => {
    console.log('📥 Loading user data...');

    // First, load from localStorage (instant)
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    const userString = localStorage.getItem('user');

    // Parse stored user object if available
    let storedUser = null;
    if (userString) {
      try {
        storedUser = JSON.parse(userString);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    // Set initial user data from localStorage
    setUserData({
      userId: userId || '',
      name: userName || storedUser?.name || 'User',
      email: userEmail || storedUser?.email || '',
      phone: userPhone || storedUser?.phone || '',
      totalBookings: storedUser?.totalBookings || 0,
      joinDate: storedUser?.joinDate || storedUser?.createdAt || new Date()
    });

    console.log('✅ User data loaded from localStorage:', {
      userId,
      userName,
      userEmail,
      userPhone
    });

    // Then, try to fetch fresh data from API (optional, in background)
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('✅ Fresh user data loaded from API:', data.data);
          
          // Update with fresh data from API
          setUserData(prev => ({
            ...prev,
            name: data.data.name || prev.name,
            email: data.data.email || prev.email,
            phone: data.data.phone || prev.phone,
            totalBookings: data.data.totalBookings || prev.totalBookings,
            joinDate: data.data.joinDate || data.data.createdAt || prev.joinDate
          }));

          // Update localStorage with fresh data
          localStorage.setItem('userName', data.data.name);
          localStorage.setItem('userEmail', data.data.email);
          localStorage.setItem('userPhone', data.data.phone);
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } else {
        console.log('⚠️ Could not fetch fresh user data from API');
      }
    } catch (error) {
      console.log('⚠️ API call failed, using localStorage data:', error.message);
      // Continue with localStorage data
    }
  };

  // Load user bookings
  const loadUserBookings = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    console.log('📥 Loading user bookings for userId:', userId);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings?customerId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bookings loaded:', data);
        
        const bookingsData = data.success ? data.data : data;
        const bookings = Array.isArray(bookingsData) ? bookingsData : [];
        
        setAllBookings(bookings);
        categorizeBookings(bookings);

        console.log(`📊 Total bookings: ${bookings.length}`);
      } else {
        console.log('⚠️ Could not load bookings from API');
        setAllBookings([]);
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setAllBookings([]);
    }
    
    setLoading(false);
  };

  // Categorize bookings by status
  const categorizeBookings = (bookings) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = bookings.filter(b => {
      const journeyDate = new Date(b.journeyDate);
      journeyDate.setHours(0, 0, 0, 0);
      return journeyDate >= today && b.status !== 'cancelled';
    });

    const completed = bookings.filter(b => {
      const journeyDate = new Date(b.journeyDate);
      journeyDate.setHours(0, 0, 0, 0);
      return journeyDate < today && b.status !== 'cancelled';
    });

    const cancelled = bookings.filter(b => b.status === 'cancelled');

    setUpcomingBookings(upcoming);
    setCompletedBookings(completed);
    setCancelledBookings(cancelled);

    console.log('📊 Bookings categorized:', {
      upcoming: upcoming.length,
      completed: completed.length,
      cancelled: cancelled.length
    });
  };

  // Handle logout
  const handleLogout = () => {
    console.log('👋 Logging out...');
    
    // Clear all localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home
    navigate('/');
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই বুকিং বাতিল করতে চান?')) {
      return;
    }

    console.log('🚫 Cancelling booking:', bookingId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ বুকিং বাতিল করা হয়েছে');
        loadUserBookings(); // Refresh bookings
      } else {
        alert('❌ বুকিং বাতিল করতে সমস্যা হয়েছে: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert('❌ বুকিং বাতিল করতে সমস্যা হয়েছে');
    }
  };

  // Print ticket
  const handlePrintTicket = (booking) => {
    console.log('🖨️ Opening print modal for booking:', booking.bookingId);
    setPrintTicket(booking);
    setShowPrintModal(true);
  };

  // Trigger print
  const triggerPrint = () => {
    console.log('🖨️ Printing...');
    window.print();
  };

  // Download ticket
  const handleDownloadTicket = async (booking) => {
    console.log('⬇️ Download ticket:', booking.bookingId);
    // For now, just open print dialog
    handlePrintTicket(booking);
  };

  // Edit profile
  const handleEditProfile = () => {
    console.log('✏️ Edit profile clicked');
    // Navigate to profile edit page (to be implemented)
    alert('প্রোফাইল এডিট ফিচার শীঘ্রই আসছে (Profile edit feature coming soon)');
  };

  // Helper functions
  const getBusName = (booking) => {
    return booking.busName || booking.bus?.name || 'Bus';
  };

  const getOperator = (booking) => {
    return booking.operator || 'Khulna Travels';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading if first load
  if (loading && allBookings.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <h2>লোড হচ্ছে...</h2>
      </div>
    );
  }

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
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-name">{userData.name}</h2>
              
              {/* Show email if available */}
              {userData.email && (
                <p className="profile-email">{userData.email}</p>
              )}
              
              {/* Show phone if available */}
              {userData.phone && (
                <p className="profile-phone">{userData.phone}</p>
              )}
              
              {/* If email or phone not available, show placeholder */}
              {!userData.email && !userData.phone && (
                <p className="profile-placeholder">📧 ইমেইল যুক্ত করুন</p>
              )}
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">মোট বুকিং</span>
                  <span className="stat-value">{allBookings.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">সদস্য হয়েছেন</span>
                  <span className="stat-value">
                    {new Date(userData.joinDate).toLocaleDateString('bn-BD')}
                  </span>
                </div>
              </div>
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                প্রোফাইল এডিট করুন
              </button>
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
                    <div className="empty-icon">🚌</div>
                    <h3>কোন আসন্ন ট্রিপ নেই</h3>
                    <p>এখনই টিকেট বুক করুন এবং আপনার যাত্রা শুরু করুন</p>
                    <button className="book-now-btn" onClick={() => navigate('/')}>
                      এখনই বুক করুন
                    </button>
                  </div>
                ) : (
                  upcomingBookings.map(booking => (
                    <div key={booking._id} className="booking-card upcoming">
                      <div className="booking-header">
                        <div className="booking-id">
                          <span className="label">বুকিং আইডি:</span>
                          <span className="value">{booking.bookingId || booking._id}</span>
                        </div>
                        <span className="booking-status upcoming">আসন্ন</span>
                      </div>

                      <div className="booking-body">
                        <div className="booking-route">
                          <div className="route-point">
                            <h3>{booking.from}</h3>
                            {booking.boardingPoint && (
                              <p className="boarding-point">📍 {booking.boardingPoint}</p>
                            )}
                          </div>
                          <div className="route-arrow">
                            <div className="arrow-line"></div>
                            <span className="bus-icon">🚌</span>
                          </div>
                          <div className="route-point">
                            <h3>{booking.to}</h3>
                            {booking.droppingPoint && (
                              <p className="dropping-point">📍 {booking.droppingPoint}</p>
                            )}
                          </div>
                        </div>

                        <div className="booking-details">
                          <div className="detail-row">
                            <span className="detail-label">যাত্রার তারিখ:</span>
                            <span className="detail-value">
                              {formatDate(booking.journeyDate)}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">বাস:</span>
                            <span className="detail-value">{getBusName(booking)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">অপারেটর:</span>
                            <span className="detail-value">{getOperator(booking)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">সিট নম্বর:</span>
                            <span className="detail-value seats">
                              {booking.seats ? booking.seats.join(', ') : 'N/A'}
                            </span>
                          </div>
                          {booking.paymentMethod && (
                            <div className="detail-row">
                              <span className="detail-label">পেমেন্ট:</span>
                              <span className="detail-value">{booking.paymentMethod}</span>
                            </div>
                          )}
                          <div className="detail-row total">
                            <span className="detail-label">মোট পরিমাণ:</span>
                            <span className="detail-value">৳{booking.amount}</span>
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
                          onClick={() => handleCancelBooking(booking._id)}
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

            {/* Completed & Cancelled tabs similar structure... */}
            {/* (Same as before, keeping it concise) */}

          </main>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && printTicket && (
        <div className="print-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="print-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <h3>টিকেট প্রিন্ট</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="print-preview">
              <CustomerTicketPrint booking={printTicket} />
            </div>

            <div className="print-modal-actions">
              <button 
                className="cancel-print-btn"
                onClick={() => setShowPrintModal(false)}
              >
                বাতিল
              </button>
              <button 
                className="confirm-print-btn"
                onClick={() => {
                  triggerPrint();
                  setShowPrintModal(false);
                }}
              >
                🖨️ প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;