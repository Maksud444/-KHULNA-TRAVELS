import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load admin data
    fetch('/admin-staff-customer-data.json')
      .then(res => res.json())
      .then(jsonData => {
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

  if (loading || !data) {
    return <div className="admin-loading">Loading...</div>;
  }

  const stats = data.statistics;

  return (
    <div className="admin-dashboard">
      {/* Top Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>KHULNA TRAVELS</p>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="admin-name">{data.admins[0].name}</span>
              <span className="admin-role">Administrator</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="icon">📝</span>
              Bookings
            </button>
            <button 
              className={`nav-item ${activeTab === 'buses' ? 'active' : ''}`}
              onClick={() => setActiveTab('buses')}
            >
              <span className="icon">🚌</span>
              Buses
            </button>
            <button 
              className={`nav-item ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              <span className="icon">🛣️</span>
              Routes
            </button>
            <button 
              className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <span className="icon">👥</span>
              Staff
            </button>
            <button 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="icon">👤</span>
              Customers
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="icon">📈</span>
              Reports
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="icon">⚙️</span>
              Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2 className="tab-title">Overview</h2>
              
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">🚌</div>
                  <div className="stat-info">
                    <h3>Total Buses</h3>
                    <p className="stat-number">{stats.totalBuses}</p>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">🛣️</div>
                  <div className="stat-info">
                    <h3>Total Routes</h3>
                    <p className="stat-number">{stats.totalRoutes}</p>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>Today's Bookings</h3>
                    <p className="stat-number">{stats.todayBookings}</p>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>Monthly Revenue</h3>
                    <p className="stat-number">৳{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="stat-card teal">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>Active Customers</h3>
                    <p className="stat-number">{stats.activeCustomers}</p>
                  </div>
                </div>

                <div className="stat-card red">
                  <div className="stat-icon">👤</div>
                  <div className="stat-info">
                    <h3>Total Staff</h3>
                    <p className="stat-number">{stats.totalStaff}</p>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="recent-section">
                <h3 className="section-title">Recent Bookings</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Date</th>
                        <th>Seats</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Booked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentBookings.map(booking => (
                        <tr key={booking.bookingId}>
                          <td className="booking-id">{booking.bookingId}</td>
                          <td>{booking.customerName}</td>
                          <td>{booking.from} → {booking.to}</td>
                          <td>{new Date(booking.journeyDate).toLocaleDateString('bn-BD')}</td>
                          <td>{booking.seats.join(', ')}</td>
                          <td className="amount">৳{booking.amount}</td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>{booking.bookedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Buses Tab */}
          {activeTab === 'buses' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Bus Management</h2>
                <button className="add-btn">+ Add New Bus</button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bus ID</th>
                      <th>Bus Name</th>
                      <th>Number</th>
                      <th>Type</th>
                      <th>Seats</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Next Maintenance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.buses.map(bus => (
                      <tr key={bus.busId}>
                        <td>{bus.busId}</td>
                        <td className="bus-name">{bus.busName}</td>
                        <td>{bus.busNumber}</td>
                        <td>
                          <span className={`type-badge ${bus.type === 'AC' ? 'ac' : 'non-ac'}`}>
                            {bus.type}
                          </span>
                        </td>
                        <td>{bus.totalSeats}</td>
                        <td>{bus.route}</td>
                        <td>
                          <span className={`status-badge ${bus.status}`}>
                            {bus.status}
                          </span>
                        </td>
                        <td>{new Date(bus.nextMaintenance).toLocaleDateString('bn-BD')}</td>
                        <td className="action-btns">
                          <button className="edit-btn">Edit</button>
                          <button className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Route Management</h2>
                <button className="add-btn">+ Add New Route</button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Route ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Distance</th>
                      <th>Duration</th>
                      <th>Fare</th>
                      <th>Active Buses</th>
                      <th>Daily Trips</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.routes.map(route => (
                      <tr key={route.routeId}>
                        <td>{route.routeId}</td>
                        <td>{route.from}</td>
                        <td>{route.to}</td>
                        <td>{route.distance}</td>
                        <td>{route.duration}</td>
                        <td className="amount">৳{route.fare}</td>
                        <td>{route.activeBuses}</td>
                        <td>{route.dailyTrips}</td>
                        <td className="action-btns">
                          <button className="edit-btn">Edit</button>
                          <button className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Staff Management</h2>
                <button className="add-btn">+ Add New Staff</button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Phone</th>
                      <th>Join Date</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staff.map(staff => (
                      <tr key={staff.staffId}>
                        <td>{staff.staffId}</td>
                        <td className="staff-name">{staff.name}</td>
                        <td>{staff.role}</td>
                        <td>{staff.location}</td>
                        <td>{staff.phone}</td>
                        <td>{new Date(staff.joinDate).toLocaleDateString('bn-BD')}</td>
                        <td className="amount">৳{staff.salary.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${staff.status}`}>
                            {staff.status}
                          </span>
                        </td>
                        <td className="action-btns">
                          <button className="edit-btn">Edit</button>
                          <button className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'bookings' || activeTab === 'customers' || 
            activeTab === 'reports' || activeTab === 'settings') && (
            <div className="tab-content">
              <h2 className="tab-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p className="coming-soon">This section is under development...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;