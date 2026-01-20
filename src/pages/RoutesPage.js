import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoutesPage.css';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // helper
  const capitalizeFirst = (s) => {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Static popular routes data
  const popularRoutes = [
    {
      from: 'kuakata',
      to: 'Khulna',
      image: 'https://via.placeholder.com/300x200?text=Dhaka+to+Khulna',
      busName: 'Khulna Travels'
    },
    {
      from: 'jossore',
      to: 'kuakata',
      image: 'https://via.placeholder.com/300x200?text=Khulna+to+Dhaka',
      busName: 'Khulna Travels'
    }
  ];

  useEffect(() => {
    // Set static routes
    setRoutes(popularRoutes);
    setLoading(false);
  }, []);

  const popularRoutesSlice = routes.slice(0, 6);



  return (
    <section className="routes-section-pro" id="routes">
      <div className="container">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Our Bus Routes</h2>
          <p className="section-subtitle-pro">
            Khulna Travels provides regular bus services on various important routes in Bangladesh
          </p>
        </div>

        {/* Routes grid — search omitted to mirror HomePage section */}

        <div className="routes-grid-pro">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : popularRoutesSlice.length === 0 ? (
            <div className="empty">No routes found.</div>
          ) : (
            popularRoutesSlice.map((route, idx) => (
              <div key={idx} className="route-card-pro">
                <div className="route-badge">জনপ্রিয়</div>
                <div className="route-path">
                  <span className="route-from">{capitalizeFirst(route.from)}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{capitalizeFirst(route.to)}</span>
                </div>
                <div className="route-details">
                  <div className="route-info-item">
                    <span className="info-icon">🚌</span>
                    <span>{route.busName || 'Khulna Travels'}</span>
                  </div>
                  <div className="route-info-item">
                    <span className="info-icon">⏱️</span>
                    <span>দৈনিক সেবা</span>
                  </div>
                </div>
                <button 
                  className="route-book-btn"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    navigate('/bus-list', { state: { from: route.from, to: route.to, date: today } });
                  }}
                >
                  এখনই বুক করুন
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RoutesPage;
