import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CounterStaffDashboard.css';
import TicketPrint from './Ticketprint';

const CounterStaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new-booking');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // Staff info from localStorage
  const [staffInfo, setStaffInfo] = useState({
    staffId: '',
    name: '',
    phone: '',
    counter_location: '',
    totalTickets: 0,
    todayTickets: 0
  });

  // Data states
  const [roads, setRoads] = useState([]);
  const [buses, setBuses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [todayStats, setTodayStats] = useState({
    bookings: 0,
    tickets: 0,
    revenue: 0,
    pending: 0
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    from: '',
    to: '',
    journeyDate: '',
    busId: '',
    roadId: '',
    seats: '',
    boardingPoint: '',
    droppingPoint: '',
    farePerSeat: 0,
    totalAmount: 0,
    paymentMethod: 'cash'
  });

  // Print states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);
  const [printMode, setPrintMode] = useState('single'); // 'single' or 'batch'

  // Load staff info and data
  useEffect(() => {
    loadStaffInfo();
    fetchRoads();
    fetchMyBookings();
    fetchTodayStats();
  }, []);

  // Load staff info from localStorage
  const loadStaffInfo = () => {
    const userId = localStorage.getItem('userId');
    const staffName = localStorage.getItem('staffName') || 'Counter Staff';
    const counterLocation = localStorage.getItem('counter_location') || 'Khulna Counter';
    
    setStaffInfo({
      staffId: userId,
      name: staffName,
      counter_location: counterLocation,
      totalTickets: 0,
      todayTickets: 0
    });
  };

  // Fetch roads
  const fetchRoads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roads`);
      const data = await response.json();
      const roadsData = data.success ? data.data : data;
      setRoads(Array.isArray(roadsData) ? roadsData : []);
    } catch (error) {
      console.error('Error fetching roads:', error);
    }
  };

  // Fetch buses for selected road
  const fetchBusesForRoad = async (roadId) => {
    if (!roadId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/buses?roadId=${roadId}`);
      const data = await response.json();
      const busesData = data.success ? data.data : data;
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  // Fetch my bookings
  const fetchMyBookings = async () => {
    const staffId = localStorage.getItem('userId');
    if (!staffId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings?staffId=${staffId}`);
      const data = await response.json();
      const bookingsData = data.success ? data.data : data;
      setMyBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch today's statistics
  const fetchTodayStats = async () => {
    const staffId = localStorage.getItem('userId');
    if (!staffId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/staff/${staffId}/stats`);
      const data = await response.json();
      if (data.success) {
        setTodayStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setBookingForm(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total amount
      if (field === 'seats' || field === 'farePerSeat') {
        const seatsArray = updated.seats.split(',').filter(s => s.trim());
        updated.totalAmount = seatsArray.length * (updated.farePerSeat || 0);
      }

      return updated;
    });
  };

  // Handle route selection (from/to)
  const handleRouteChange = async () => {
    if (bookingForm.from && bookingForm.to) {
      // Find matching road
      const road = roads.find(r => 
        r.origin.toLowerCase() === bookingForm.from.toLowerCase() &&
        r.destination.toLowerCase() === bookingForm.to.toLowerCase()
      );

      if (road) {
        setBookingForm(prev => ({ ...prev, roadId: road._id }));
        
        // Get fare from road stops
        const toStop = road.stops?.find(s => 
          s.name.toLowerCase() === bookingForm.to.toLowerCase()
        );
        if (toStop) {
          handleInputChange('farePerSeat', toStop.price);
        }

        // Fetch buses for this road
        await fetchBusesForRoad(road._id);
      }
    }
  };

  // Submit booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingForm.customerName || !bookingForm.customerPhone) {
      alert('Please enter customer name and phone number');
      return;
    }

    if (!bookingForm.busId || !bookingForm.seats) {
      alert('অনুগ্রহ করে বাস ও আসন নির্বাচন করুন');
      return;
    }

    setLoading(true);

    try {
      const seatsArray = bookingForm.seats.split(',').map(s => s.trim()).filter(Boolean);
      
      const bookingData = {
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.customerPhone,
        busId: bookingForm.busId,
        roadId: bookingForm.roadId,
        from: bookingForm.from,
        to: bookingForm.to,
        journeyDate: bookingForm.journeyDate,
        seats: seatsArray,
        boardingPoint: bookingForm.boardingPoint,
        droppingPoint: bookingForm.droppingPoint,
        amount: bookingForm.totalAmount,
        paymentMethod: bookingForm.paymentMethod,
        bookedBy: 'Counter',
        staffId: staffInfo.staffId,
        counter: staffInfo.counter_location,
        status: 'confirmed'
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ বুকিং সফল হয়েছে!');
        
        // Reset form
        setBookingForm({
          customerName: '',
          customerPhone: '',
          from: '',
          to: '',
          journeyDate: '',
          busId: '',
          roadId: '',
          seats: '',
          boardingPoint: '',
          droppingPoint: '',
          farePerSeat: 0,
          totalAmount: 0,
          paymentMethod: 'cash'
        });

        // Refresh bookings
        fetchMyBookings();
        fetchTodayStats();

        // Show print option
        if (window.confirm('টিকেট প্রিন্ট করবেন?')) {
          setPrintTicket(data.data);
          setPrintMode('single');
          setShowPrintModal(true);
        }
      } else {
        alert('❌ বুকিং করতে সমস্যা হয়েছে: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('❌ বুকিং করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setBookingForm({
      customerName: '',
      customerPhone: '',
      from: '',
      to: '',
      journeyDate: '',
      busId: '',
      roadId: '',
      seats: '',
      boardingPoint: '',
      droppingPoint: '',
      farePerSeat: 0,
      totalAmount: 0,
      paymentMethod: 'cash'
    });
    setBuses([]);
  };

  // Print single ticket
  const handlePrintSingle = (booking) => {
    setPrintTicket(booking);
    setPrintMode('single');
    setShowPrintModal(true);
  };

  // Print all today's tickets
  const handlePrintAll = () => {
    if (myBookings.length === 0) {
      alert('কোনো টিকেট নেই প্রিন্ট করার জন্য');
      return;
    }
    setPrintMode('batch');
    setShowPrintModal(true);
  };

  // Trigger print
  const triggerPrint = () => {
    window.print();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('staffName');
    localStorage.removeItem('counter_location');
    navigate('/');
  };

  // Get unique locations from roads
  const getLocations = () => {
    const locations = new Set();
    roads.forEach(road => {
      locations.add(road.origin);
      locations.add(road.destination);
      road.stops?.forEach(stop => locations.add(stop.name));
    });
    return Array.from(locations).sort();
  };

  // Get bus name by ID
  const getBusName = (busId) => {
    const bus = buses.find(b => b._id === busId);
    return bus ? bus.name : 'N/A';
  };

  // Get today's date for min date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const locations = getLocations();

  return (
    <div className="counter-staff-dashboard">
      {/* Header */}
      <header className="staff-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Counter Staff Dashboard</h1>
            <p className="counter-location">📍 {staffInfo.counter_location}</p>
          </div>
          <div className="header-right">
            <div className="staff-profile">
              <span className="staff-name">{staffInfo.name}</span>
              <span className="staff-id">ID: {staffInfo.staffId}</span>
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
              <p className="stat-value">{todayStats.bookings || myBookings.length}</p>
            </div>
          </div>

          <div className="stat-box blue">
            <div className="stat-icon">🎫</div>
            <div className="stat-details">
              <h3>টিকেট ইস্যু</h3>
              <p className="stat-value">{todayStats.tickets || myBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0)}</p>
            </div>
          </div>

          <div className="stat-box purple">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>আজকের রেভিনিউ</h3>
              <p className="stat-value">৳{(todayStats.revenue || myBookings.reduce((sum, b) => sum + (b.amount || 0), 0)).toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-box orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <h3>পেন্ডিং</h3>
              <p className="stat-value">{todayStats.pending || myBookings.filter(b => b.status === 'pending').length}</p>
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
              নতুন বুকিং
            </button>
            <button 
              className={`staff-tab ${activeTab === 'my-bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-bookings')}
            >
              <span className="tab-icon">📋</span>
              আমার বুকিং ({myBookings.length})
            </button>
          </div>

          {/* New Booking Tab */}
          {activeTab === 'new-booking' && (
            <div className="tab-panel">
              <h2 className="panel-title">নতুন বুকিং তৈরি করুন</h2>
              
              <form className="booking-form" onSubmit={handleSubmitBooking}>
                {/* Customer Info */}
                <div className="form-section">
                  <h3 className="section-title">গ্রাহক তথ্য</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>যাত্রীর নাম *</label>
                      <input 
                        type="text" 
                        placeholder="পূর্ণ নাম লিখুন"
                        value={bookingForm.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>মোবাইল নম্বর *</label>
                      <input 
                        type="tel" 
                        placeholder="০১৭১২৩৪৫৬৭৮"
                        value={bookingForm.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Journey Info */}
                <div className="form-section">
                  <h3 className="section-title">যাত্রা তথ্য</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>যাত্রা শুরু (From) *</label>
                      <select
                        value={bookingForm.from}
                        onChange={(e) => {
                          handleInputChange('from', e.target.value);
                          setTimeout(handleRouteChange, 100);
                        }}
                        required
                      >
                        <option value="">স্থান নির্বাচন করুন</option>
                        {locations.map((loc, index) => (
                          <option key={index} value={loc}>
                            {loc.charAt(0).toUpperCase() + loc.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>গন্তব্য (To) *</label>
                      <select
                        value={bookingForm.to}
                        onChange={(e) => {
                          handleInputChange('to', e.target.value);
                          setTimeout(handleRouteChange, 100);
                        }}
                        required
                      >
                        <option value="">গন্তব্য নির্বাচন করুন</option>
                        {locations.map((loc, index) => (
                          <option key={index} value={loc}>
                            {loc.charAt(0).toUpperCase() + loc.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>যাত্রার তারিখ *</label>
                      <input 
                        type="date"
                        min={getTodayDate()}
                        value={bookingForm.journeyDate}
                        onChange={(e) => handleInputChange('journeyDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>বাস নির্বাচন করুন *</label>
                      <select
                        value={bookingForm.busId}
                        onChange={(e) => handleInputChange('busId', e.target.value)}
                        required
                        disabled={buses.length === 0}
                      >
                        <option value="">
                          {buses.length === 0 ? 'রুট নির্বাচন করুন আগে' : 'বাস নির্বাচন করুন'}
                        </option>
                        {buses.map(bus => (
                          <option key={bus._id} value={bus._id}>
                            {bus.name} - {bus.busNumber} ({bus.bus_type || 'NON AC'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>বোর্ডিং পয়েন্ট *</label>
                      <input
                        type="text"
                        placeholder="উঠার স্থান"
                        value={bookingForm.boardingPoint}
                        onChange={(e) => handleInputChange('boardingPoint', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>ড্রপিং পয়েন্ট *</label>
                      <input
                        type="text"
                        placeholder="নামার স্থান"
                        value={bookingForm.droppingPoint}
                        onChange={(e) => handleInputChange('droppingPoint', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seat & Payment Info */}
                <div className="form-section">
                  <h3 className="section-title">আসন ও পেমেন্ট</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>আসন নম্বর * (কমা দিয়ে আলাদা করুন)</label>
                      <input 
                        type="text" 
                        placeholder="A1, A2, B3"
                        value={bookingForm.seats}
                        onChange={(e) => handleInputChange('seats', e.target.value)}
                        required
                      />
                      <small className="form-hint">উদাহরণ: A1, A2 অথবা B3, B4</small>
                    </div>
                    <div className="form-group">
                      <label>প্রতি আসনের ভাড়া *</label>
                      <input 
                        type="number" 
                        placeholder="650"
                        value={bookingForm.farePerSeat}
                        onChange={(e) => handleInputChange('farePerSeat', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>মোট টাকা</label>
                      <input 
                        type="number" 
                        value={bookingForm.totalAmount}
                        disabled
                        className="calculated-field"
                      />
                      <small className="form-hint">
                        {bookingForm.seats.split(',').filter(s => s.trim()).length} আসন × ৳{bookingForm.farePerSeat}
                      </small>
                    </div>
                    <div className="form-group">
                      <label>পেমেন্ট মেথড *</label>
                      <select
                        value={bookingForm.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        required
                      >
                        <option value="cash">ক্যাশ</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'বুকিং হচ্ছে...' : '✓ বুকিং কনফার্ম করুন'}
                  </button>
                  <button 
                    type="button" 
                    className="reset-btn"
                    onClick={handleResetForm}
                  >
                    ↺ ফর্ম রিসেট করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2 className="panel-title">আমার আজকের বুকিং</h2>
                <button 
                  className="print-all-btn"
                  onClick={handlePrintAll}
                  disabled={myBookings.length === 0}
                >
                  🖨️ সব টিকেট প্রিন্ট করুন
                </button>
              </div>
              
              <div className="bookings-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>গ্রাহক</th>
                      <th>ফোন</th>
                      <th>রুট</th>
                      <th>তারিখ</th>
                      <th>আসন</th>
                      <th>টাকা</th>
                      <th>কাউন্টার</th>
                      <th>সময়</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="no-data">
                          আজ কোনো বুকিং নেই
                        </td>
                      </tr>
                    ) : (
                      myBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="booking-id">{booking.bookingId || booking._id}</td>
                          <td>{booking.customerName}</td>
                          <td>{booking.customerPhone}</td>
                          <td>{booking.from} → {booking.to}</td>
                          <td>{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</td>
                          <td>{booking.seats?.join(', ')}</td>
                          <td className="amount">৳{booking.amount}</td>
                          <td>{booking.counter}</td>
                          <td>{new Date(booking.createdAt || booking.bookingDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="action-btns">
                            <button 
                              className="view-btn"
                              onClick={() => alert('View details: ' + JSON.stringify(booking, null, 2))}
                            >
                              দেখুন
                            </button>
                            <button 
                              className="print-btn"
                              onClick={() => handlePrintSingle(booking)}
                            >
                              🖨️ প্রিন্ট
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {myBookings.length > 0 && (
                <div className="bookings-summary">
                  <div className="summary-item">
                    <span>মোট বুকিং:</span>
                    <strong>{myBookings.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span>মোট টিকেট:</span>
                    <strong>{myBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>মোট আয়:</span>
                    <strong>৳{myBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="print-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="print-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <h3>{printMode === 'single' ? 'টিকেট প্রিন্ট' : 'সব টিকেট প্রিন্ট'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="print-preview">
              {printMode === 'single' && printTicket && (
                <TicketPrint booking={printTicket} />
              )}
              {printMode === 'batch' && myBookings.map((booking) => (
                <TicketPrint key={booking._id} booking={booking} />
              ))}
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

export default CounterStaffDashboard;