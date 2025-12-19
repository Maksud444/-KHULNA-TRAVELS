import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // State for different data
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalRoads: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    activeCustomers: 0,
    totalStaff: 0,
    totalCounterStaff: 0,
    totalSupervisors: 0
  });

  const [roads, setRoads] = useState([]);
  const [buses, setBuses] = useState([]);
  const [counterStaff, setCounterStaff] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    counter_location: '',
    role: 'counter_staff'
  });

  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    phone: '',
    busId: '',
    coachNumber: ''
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRoads(),
        fetchBuses(),
        fetchCounterStaff(),
        fetchSupervisors(),
        fetchCustomers(),
        fetchBookings(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
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
      setRoads([]);
    }
  };

  // Fetch buses
  const fetchBuses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/buses`);
      const data = await response.json();
      const busesData = data.success ? data.data : data;
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  // Fetch counter staff
  const fetchCounterStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff?role=counter_staff`);
      const data = await response.json();
      const staffData = data.success ? data.data : data;
      setCounterStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching counter staff:', error);
      setCounterStaff([]);
    }
  };

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/supervisors`);
      const data = await response.json();
      const supervisorData = data.success ? data.data : data;
      setSupervisors(Array.isArray(supervisorData) ? supervisorData : []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      setSupervisors([]);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      const data = await response.json();
      const customerData = data.success ? data.data : data;
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`);
      const data = await response.json();
      const bookingData = data.success ? data.data : data;
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Add new counter staff
  const handleAddCounterStaff = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });

      if (response.ok) {
        alert('কাউন্টার স্টাফ সফলভাবে যোগ করা হয়েছে!');
        setShowModal(false);
        setNewStaff({
          name: '',
          phone: '',
          username: '',
          password: '',
          counter_location: '',
          role: 'counter_staff'
        });
        fetchCounterStaff();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('স্টাফ যোগ করতে সমস্যা হয়েছে');
    }
  };

  // Add new supervisor
  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/supervisors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupervisor)
      });

      if (response.ok) {
        alert('সুপারভাইজার সফলভাবে যোগ করা হয়েছে!');
        setShowModal(false);
        setNewSupervisor({
          name: '',
          phone: '',
          busId: '',
          coachNumber: ''
        });
        fetchSupervisors();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error adding supervisor:', error);
      alert('সুপারভাইজার যোগ করতে সমস্যা হয়েছে');
    }
  };

  // Delete staff
  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই স্টাফ মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('স্টাফ মুছে ফেলা হয়েছে');
        fetchCounterStaff();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  // Delete supervisor
  const handleDeleteSupervisor = async (supervisorId) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই সুপারভাইজার মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/supervisors/${supervisorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('সুপারভাইজার মুছে ফেলা হয়েছে');
        fetchSupervisors();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      alert('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  // Toggle customer status
  const handleToggleCustomerStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('কাস্টমার স্ট্যাটাস আপডেট করা হয়েছে');
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // Get bus name by ID
  const getBusName = (busId) => {
    const bus = buses.find(b => b._id === busId || b.id === busId);
    return bus ? bus.name : 'N/A';
  };

  // Get road name by ID
  const getRoadName = (roadId) => {
    const road = roads.find(r => r._id === roadId || r.id === roadId);
    return road ? road.roadName : 'N/A';
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Open modal
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Top Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>খুলনা ট্রাভেলস</p>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="admin-name">Admin</span>
              <span className="admin-role">Administrator</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="icon">📊</span>
              Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'counter-staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('counter-staff')}
            >
              <span className="icon">👥</span>
              কাউন্টার স্টাফ
            </button>
            <button 
              className={`nav-item ${activeTab === 'supervisors' ? 'active' : ''}`}
              onClick={() => setActiveTab('supervisors')}
            >
              <span className="icon">👔</span>
              সুপারভাইজার
            </button>
            <button 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="icon">👤</span>
              কাস্টমার
            </button>
            <button 
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="icon">📝</span>
              বুকিং
            </button>
            <button 
              className={`nav-item ${activeTab === 'buses' ? 'active' : ''}`}
              onClick={() => setActiveTab('buses')}
            >
              <span className="icon">🚌</span>
              বাস
            </button>
            <button 
              className={`nav-item ${activeTab === 'roads' ? 'active' : ''}`}
              onClick={() => setActiveTab('roads')}
            >
              <span className="icon">🛣️</span>
              রুট/রোড
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="icon">📈</span>
              রিপোর্ট
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="icon">⚙️</span>
              সেটিংস
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2 className="tab-title">ড্যাশবোর্ড সারসংক্ষেপ</h2>
              
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">🚌</div>
                  <div className="stat-info">
                    <h3>মোট বাস</h3>
                    <p className="stat-number">{buses.length}</p>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">🛣️</div>
                  <div className="stat-info">
                    <h3>মোট রুট</h3>
                    <p className="stat-number">{roads.length}</p>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>আজকের বুকিং</h3>
                    <p className="stat-number">{bookings.length}</p>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>মাসিক আয়</h3>
                    <p className="stat-number">৳{stats.monthlyRevenue?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="stat-card teal">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>কাউন্টার স্টাফ</h3>
                    <p className="stat-number">{counterStaff.length}</p>
                  </div>
                </div>

                <div className="stat-card red">
                  <div className="stat-icon">👔</div>
                  <div className="stat-info">
                    <h3>সুপারভাইজার</h3>
                    <p className="stat-number">{supervisors.length}</p>
                  </div>
                </div>

                <div className="stat-card pink">
                  <div className="stat-icon">👤</div>
                  <div className="stat-info">
                    <h3>মোট কাস্টমার</h3>
                    <p className="stat-number">{customers.length}</p>
                  </div>
                </div>

                <div className="stat-card indigo">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <h3>সক্রিয় কাস্টমার</h3>
                    <p className="stat-number">
                      {customers.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3 className="section-title">দ্রুত কাজ</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn blue"
                    onClick={() => openModal('add-staff')}
                  >
                    <span className="icon">➕</span>
                    নতুন স্টাফ যোগ করুন
                  </button>
                  <button 
                    className="action-btn green"
                    onClick={() => openModal('add-supervisor')}
                  >
                    <span className="icon">➕</span>
                    সুপারভাইজার যোগ করুন
                  </button>
                  <button 
                    className="action-btn purple"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <span className="icon">📝</span>
                    বুকিং দেখুন
                  </button>
                  <button 
                    className="action-btn orange"
                    onClick={() => setActiveTab('reports')}
                  >
                    <span className="icon">📈</span>
                    রিপোর্ট তৈরি করুন
                  </button>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="recent-section">
                <h3 className="section-title">সাম্প্রতিক বুকিং</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>বুকিং ID</th>
                        <th>কাস্টমার</th>
                        <th>রুট</th>
                        <th>তারিখ</th>
                        <th>আসন</th>
                        <th>পরিমাণ</th>
                        <th>বুক করেছেন</th>
                        <th>স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 10).map((booking, index) => (
                        <tr key={booking._id || index}>
                          <td className="booking-id">{booking.bookingId || booking._id}</td>
                          <td>{booking.customerName || 'N/A'}</td>
                          <td>{booking.from} → {booking.to}</td>
                          <td>{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</td>
                          <td>{booking.seats?.join(', ') || 'N/A'}</td>
                          <td className="amount">৳{booking.amount || 0}</td>
                          <td>{booking.bookedBy || 'Online'}</td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Counter Staff Tab */}
          {activeTab === 'counter-staff' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">কাউন্টার স্টাফ ম্যানেজমেন্ট</h2>
                <button 
                  className="add-btn"
                  onClick={() => openModal('add-staff')}
                >
                  + নতুন স্টাফ যোগ করুন
                </button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>স্টাফ ID</th>
                      <th>নাম</th>
                      <th>ফোন</th>
                      <th>ইউজারনেম</th>
                      <th>কাউন্টার</th>
                      <th>মোট টিকেট</th>
                      <th>আজকের টিকেট</th>
                      <th>যোগদানের তারিখ</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counterStaff.map((staff) => (
                      <tr key={staff._id}>
                        <td>{staff.staffId || staff._id}</td>
                        <td className="staff-name">{staff.name}</td>
                        <td>{staff.phone}</td>
                        <td>{staff.username}</td>
                        <td>{staff.counter_location}</td>
                        <td>{staff.totalTickets || 0}</td>
                        <td>{staff.todayTickets || 0}</td>
                        <td>{new Date(staff.joinDate || Date.now()).toLocaleDateString('bn-BD')}</td>
                        <td>
                          <span className={`status-badge ${staff.status || 'active'}`}>
                            {staff.status || 'active'}
                          </span>
                        </td>
                        <td className="action-btns">
                          <button className="edit-btn">সম্পাদনা</button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteStaff(staff._id)}
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supervisors Tab */}
          {activeTab === 'supervisors' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">সুপারভাইজার ম্যানেজমেন্ট</h2>
                <button 
                  className="add-btn"
                  onClick={() => openModal('add-supervisor')}
                >
                  + সুপারভাইজার যোগ করুন
                </button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>সুপারভাইজার ID</th>
                      <th>নাম</th>
                      <th>ফোন নম্বর</th>
                      <th>বাসের নাম</th>
                      <th>কোচ নম্বর</th>
                      <th>যোগদানের তারিখ</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisors.map((supervisor) => (
                      <tr key={supervisor._id}>
                        <td>{supervisor.supervisorId || supervisor._id}</td>
                        <td className="staff-name">{supervisor.name}</td>
                        <td>{supervisor.phone}</td>
                        <td>{getBusName(supervisor.busId)}</td>
                        <td>{supervisor.coachNumber}</td>
                        <td>{new Date(supervisor.joinDate || Date.now()).toLocaleDateString('bn-BD')}</td>
                        <td>
                          <span className={`status-badge ${supervisor.status || 'active'}`}>
                            {supervisor.status || 'active'}
                          </span>
                        </td>
                        <td className="action-btns">
                          <button className="edit-btn">সম্পাদনা</button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteSupervisor(supervisor._id)}
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">কাস্টমার ম্যানেজমেন্ট</h2>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>কাস্টমার ID</th>
                      <th>নাম</th>
                      <th>ফোন</th>
                      <th>ইমেইল</th>
                      <th>মোট বুকিং</th>
                      <th>মোট খরচ</th>
                      <th>শেষ বুকিং</th>
                      <th>যোগদানের তারিখ</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.customerId || customer._id}</td>
                        <td className="customer-name">{customer.name}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td>{customer.totalBookings || 0}</td>
                        <td className="amount">৳{customer.totalSpent || 0}</td>
                        <td>
                          {customer.lastBooking 
                            ? new Date(customer.lastBooking).toLocaleDateString('bn-BD')
                            : 'N/A'
                          }
                        </td>
                        <td>{new Date(customer.joinDate || Date.now()).toLocaleDateString('bn-BD')}</td>
                        <td>
                          <span className={`status-badge ${customer.status || 'active'}`}>
                            {customer.status || 'active'}
                          </span>
                        </td>
                        <td className="action-btns">
                          <button 
                            className="edit-btn"
                            onClick={() => handleToggleCustomerStatus(customer._id, customer.status)}
                          >
                            {customer.status === 'active' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
                          </button>
                          <button className="view-btn">বিস্তারিত</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="tab-content">
              <h2 className="tab-title">সকল বুকিং</h2>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>বুকিং ID</th>
                      <th>কাস্টমার নাম</th>
                      <th>ফোন</th>
                      <th>রুট</th>
                      <th>বাস</th>
                      <th>যাত্রার তারিখ</th>
                      <th>আসন সংখ্যা</th>
                      <th>আসন</th>
                      <th>পরিমাণ</th>
                      <th>বুক করেছেন</th>
                      <th>কাউন্টার</th>
                      <th>স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="booking-id">{booking.bookingId || booking._id}</td>
                        <td>{booking.customerName}</td>
                        <td>{booking.customerPhone}</td>
                        <td>{booking.from} → {booking.to}</td>
                        <td>{getBusName(booking.busId)}</td>
                        <td>{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</td>
                        <td>{booking.seats?.length || 0}</td>
                        <td>{booking.seats?.join(', ')}</td>
                        <td className="amount">৳{booking.amount}</td>
                        <td>{booking.bookedBy}</td>
                        <td>{booking.counter || 'Online'}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Buses Tab */}
          {activeTab === 'buses' && (
            <div className="tab-content">
              <h2 className="tab-title">বাস ম্যানেজমেন্ট</h2>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>বাস নাম</th>
                      <th>বাস নম্বর</th>
                      <th>রুট</th>
                      <th>ধরন</th>
                      <th>মোট আসন</th>
                      <th>উপলব্ধ আসন</th>
                      <th>সুপারভাইজার</th>
                      <th>স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((bus) => {
                      const supervisor = supervisors.find(s => s.busId === bus._id);
                      return (
                        <tr key={bus._id}>
                          <td className="bus-name">{bus.name}</td>
                          <td>{bus.busNumber}</td>
                          <td>{getRoadName(bus.roadId)}</td>
                          <td>
                            <span className={`type-badge ${bus.bus_type === 'AC' ? 'ac' : 'non-ac'}`}>
                              {bus.bus_type || 'NON AC'}
                            </span>
                          </td>
                          <td>{bus.capacity || 40}</td>
                          <td>{bus.availableSeats || 0}</td>
                          <td>
                            {supervisor ? (
                              <div>
                                <div>{supervisor.name}</div>
                                <div className="phone-small">{supervisor.phone}</div>
                              </div>
                            ) : (
                              <span className="text-muted">No Supervisor</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${bus.status || 'active'}`}>
                              {bus.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roads Tab */}
          {activeTab === 'roads' && (
            <div className="tab-content">
              <h2 className="tab-title">রুট ম্যানেজমেন্ট</h2>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>রুট নাম</th>
                      <th>শুরু</th>
                      <th>শেষ</th>
                      <th>স্টপ সংখ্যা</th>
                      <th>সর্বোচ্চ ভাড়া</th>
                      <th>সক্রিয় বাস</th>
                      <th>স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roads.map((road) => {
                      const roadBuses = buses.filter(b => b.roadId === road._id);
                      const maxFare = road.stops?.reduce((max, stop) => 
                        Math.max(max, stop.price || 0), 0
                      ) || 0;
                      
                      return (
                        <tr key={road._id}>
                          <td className="road-name">{road.roadName}</td>
                          <td>{road.origin}</td>
                          <td>{road.destination}</td>
                          <td>{road.stops?.length || 0}</td>
                          <td className="amount">৳{maxFare}</td>
                          <td>{roadBuses.length}</td>
                          <td>
                            <span className={`status-badge ${road.status || 'active'}`}>
                              {road.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tab-content">
              <h2 className="tab-title">রিপোর্ট</h2>
              <p className="coming-soon">এই সেকশন তৈরি হচ্ছে...</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2 className="tab-title">সেটিংস</h2>
              <p className="coming-soon">এই সেকশন তৈরি হচ্ছে...</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal for Adding Staff/Supervisor */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'add-staff' && (
              <div className="modal-form">
                <h3>নতুন কাউন্টার স্টাফ যোগ করুন</h3>
                <form onSubmit={handleAddCounterStaff}>
                  <div className="form-group">
                    <label>নাম *</label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ফোন নম্বর *</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ইউজারনেম *</label>
                    <input
                      type="text"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>কাউন্টার লোকেশন *</label>
                    <input
                      type="text"
                      value={newStaff.counter_location}
                      onChange={(e) => setNewStaff({...newStaff, counter_location: e.target.value})}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                      বাতিল
                    </button>
                    <button type="submit" className="submit-btn">
                      যোগ করুন
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modalType === 'add-supervisor' && (
              <div className="modal-form">
                <h3>নতুন সুপারভাইজার যোগ করুন</h3>
                <form onSubmit={handleAddSupervisor}>
                  <div className="form-group">
                    <label>নাম *</label>
                    <input
                      type="text"
                      value={newSupervisor.name}
                      onChange={(e) => setNewSupervisor({...newSupervisor, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ফোন নম্বর *</label>
                    <input
                      type="tel"
                      value={newSupervisor.phone}
                      onChange={(e) => setNewSupervisor({...newSupervisor, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>বাস নির্বাচন করুন *</label>
                    <select
                      value={newSupervisor.busId}
                      onChange={(e) => setNewSupervisor({...newSupervisor, busId: e.target.value})}
                      required
                    >
                      <option value="">বাস নির্বাচন করুন</option>
                      {buses.map(bus => (
                        <option key={bus._id} value={bus._id}>
                          {bus.name} ({bus.busNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>কোচ নম্বর *</label>
                    <input
                      type="text"
                      value={newSupervisor.coachNumber}
                      onChange={(e) => setNewSupervisor({...newSupervisor, coachNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                      বাতিল
                    </button>
                    <button type="submit" className="submit-btn">
                      যোগ করুন
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;