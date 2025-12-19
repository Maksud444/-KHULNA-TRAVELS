import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusListPage.css';

const BusListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || {};

  const [buses, setBuses] = useState([]);
  const [road, setRoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    busType: 'all',
    timeCategory: 'all',
    sortBy: 'departure'
  });

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // Fetch road and buses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch road data if roadId is provided
        if (searchData.roadId) {
          await fetchRoadData();
        }

        // Fetch buses for this road
        await fetchBuses();

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchData]);

  // Fetch road information
  const fetchRoadData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roads/${searchData.roadId}`);
      
      if (response.ok) {
        const data = await response.json();
        const roadData = data.success ? data.data : data.road || data;
        setRoad(roadData);
        console.log('Road Data:', roadData);
      }
    } catch (err) {
      console.error('Error fetching road:', err);
    }
  };

  // Fetch buses for the road
  const fetchBuses = async () => {
    try {
      let url = `${API_BASE_URL}/buses`;
      
      // Add roadId filter if available
      if (searchData.roadId) {
        url += `?roadId=${searchData.roadId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch buses');
      }

      const data = await response.json();
      console.log('Buses API Response:', data);

      // Handle different response structures
      let busesData = [];
      if (data.success && data.data) {
        busesData = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        busesData = data;
      } else if (data.buses) {
        busesData = data.buses;
      }

      setBuses(busesData);
    } catch (err) {
      console.error('Error fetching buses:', err);
      throw err;
    }
  };

  // Get fare from road stops or bus
  const getFare = (bus) => {
    if (!bus) return searchData.price || 650;

    // Use price from search data (calculated from road stops)
    if (searchData.price) {
      return searchData.price;
    }

    // Fallback to bus base fare
    return bus.base_fare || bus.baseFare || 650;
  };

  // Get boarding time from timings array
  const getBoardingTime = (bus) => {
    if (!bus || !bus.timings || !Array.isArray(bus.timings)) {
      return 'N/A';
    }

    // Return first timing as boarding time
    return bus.timings[0] || 'N/A';
  };

  // Get arrival time - calculate from timings
  const getArrivalTime = (bus) => {
    if (!bus || !bus.timings || !Array.isArray(bus.timings)) {
      return 'N/A';
    }

    // Return last timing as arrival time
    return bus.timings[bus.timings.length - 1] || 'N/A';
  };

  // Calculate duration
  const calculateDuration = (bus) => {
    const boardingTime = getBoardingTime(bus);
    const arrivalTime = getArrivalTime(bus);

    if (boardingTime === 'N/A' || arrivalTime === 'N/A') {
      return 'N/A';
    }

    try {
      const boarding = parseTime(boardingTime);
      let arrival = parseTime(arrivalTime);

      if (boarding === null || arrival === null) {
        return 'N/A';
      }

      // Handle next-day arrival
      if (arrival < boarding) {
        arrival += 24 * 60;
      }

      const durationMinutes = arrival - boarding;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Parse time string to minutes
  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;

    try {
      const parts = timeStr.trim().split(' ');
      if (parts.length !== 2) return null;

      const [time, period] = parts;
      const timeParts = time.split(':');
      
      if (timeParts.length < 2) return null;

      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) return null;

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    } catch (e) {
      return null;
    }
  };

  // Get time category color
  const getTimeCategoryColor = (category) => {
    if (!category) return '#757575';
    
    const colors = {
      morning: '#4caf50',
      afternoon: '#ff9800',
      evening: '#f44336',
      night: '#9c27b0'
    };
    
    return colors[String(category).toLowerCase()] || '#757575';
  };

  // Get time category label
  const getTimeCategoryLabel = (category) => {
    if (!category) return '';
    
    const labels = {
      morning: 'সকাল',
      afternoon: 'দুপুর',
      evening: 'সন্ধ্যা',
      night: 'রাত'
    };
    
    return labels[String(category).toLowerCase()] || '';
  };

  // Detect time category from boarding time
  const detectTimeCategory = (bus) => {
    const boardingTime = getBoardingTime(bus);
    if (boardingTime === 'N/A') return '';

    const timeInMinutes = parseTime(boardingTime);
    if (timeInMinutes === null) return '';

    // Morning: 6:00 AM - 11:59 AM
    if (timeInMinutes >= 360 && timeInMinutes < 720) return 'morning';
    // Afternoon: 12:00 PM - 4:59 PM
    if (timeInMinutes >= 720 && timeInMinutes < 1020) return 'afternoon';
    // Evening: 5:00 PM - 8:59 PM
    if (timeInMinutes >= 1020 && timeInMinutes < 1260) return 'evening';
    // Night: 9:00 PM - 5:59 AM
    return 'night';
  };

  // Apply filters and sorting
  const getFilteredAndSortedBuses = () => {
    let filtered = [...buses];

    // Filter by bus type
    if (filters.busType !== 'all') {
      filtered = filtered.filter(bus => {
        if (!bus || !bus.bus_type) return false;
        return String(bus.bus_type).toLowerCase() === filters.busType.toLowerCase();
      });
    }

    // Filter by time category
    if (filters.timeCategory !== 'all') {
      filtered = filtered.filter(bus => {
        const category = bus.time_category || detectTimeCategory(bus);
        return String(category).toLowerCase() === filters.timeCategory.toLowerCase();
      });
    }

    // Sort buses
    filtered.sort((a, b) => {
      try {
        switch (filters.sortBy) {
          case 'departure': {
            const timeA = parseTime(getBoardingTime(a));
            const timeB = parseTime(getBoardingTime(b));
            if (timeA === null || timeB === null) return 0;
            return timeA - timeB;
          }
          case 'price-low':
            return getFare(a) - getFare(b);
          case 'price-high':
            return getFare(b) - getFare(a);
          case 'seats': {
            const seatsA = a.available_seats || a.availableSeats || 0;
            const seatsB = b.available_seats || b.availableSeats || 0;
            return seatsB - seatsA;
          }
          default:
            return 0;
        }
      } catch (e) {
        return 0;
      }
    });

    return filtered;
  };

  // Handle seat selection
  const handleSelectSeats = (bus) => {
    if (!bus) return;

    navigate('/seat-selection', {
      state: {
        bus: bus,
        searchData: searchData,
        road: road,
        boardingTime: getBoardingTime(bus),
        arrivalTime: getArrivalTime(bus),
        fare: getFare(bus)
      }
    });
  };

  const filteredBuses = getFilteredAndSortedBuses();

  if (loading) {
    return (
      <div className="bus-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>বাস খোঁজা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bus-list-page">
        <div className="error-container">
          <h3>দুঃখিত, কিছু ভুল হয়েছে</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>হোমপেজে ফিরে যান</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-list-page">
      {/* Search Summary */}
      <div className="search-summary">
        <div className="search-info">
          <h2>
            {searchData.from || 'যেকোনো স্থান'} → {searchData.to || 'যেকোনো স্থান'}
          </h2>
          <p>
            {searchData.date || 'আজ'} | {searchData.passengers || 1} জন যাত্রী
          </p>
          {road && road.roadName && (
            <p className="road-name">রুট: {road.roadName}</p>
          )}
        </div>
        <button 
          className="modify-search-btn"
          onClick={() => navigate('/')}
        >
          খোঁজ পরিবর্তন করুন
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>বাসের ধরন:</label>
          <select 
            value={filters.busType}
            onChange={(e) => setFilters({...filters, busType: e.target.value})}
          >
            <option value="all">সকল</option>
            <option value="ac">AC</option>
            <option value="non ac">NON AC</option>
          </select>
        </div>

        <div className="filter-group">
          <label>সময়:</label>
          <select
            value={filters.timeCategory}
            onChange={(e) => setFilters({...filters, timeCategory: e.target.value})}
          >
            <option value="all">সকল সময়</option>
            <option value="morning">সকাল</option>
            <option value="afternoon">দুপুর</option>
            <option value="evening">সন্ধ্যা</option>
            <option value="night">রাত</option>
          </select>
        </div>

        <div className="filter-group">
          <label>সাজান:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="departure">ছাড়ার সময়</option>
            <option value="price-low">কম দাম</option>
            <option value="price-high">বেশি দাম</option>
            <option value="seats">আসন সংখ্যা</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        <p>{filteredBuses.length}টি বাস পাওয়া গেছে</p>
      </div>

      {/* Bus List */}
      <div className="bus-list">
        {filteredBuses.length === 0 ? (
          <div className="no-buses">
            <h3>কোনো বাস পাওয়া যায়নি</h3>
            <p>অন্য রুট বা তারিখ চেষ্টা করুন</p>
          </div>
        ) : (
          filteredBuses.map((bus, index) => {
            if (!bus) return null;

            const busId = bus._id || bus.id || bus.busNumber || `bus-${index}`;
            const busName = bus.name || 'Bus';
            const busType = bus.bus_type || bus.busType || 'NON AC';
            const coachNumber = bus.coach_number || bus.coachNumber || bus.busNumber || 'N/A';
            const timeCategory = bus.time_category || bus.timeCategory || detectTimeCategory(bus);
            const totalSeats = bus.total_seats || bus.capacity || 40;
            const availableSeats = bus.available_seats || bus.availableSeats || 0;
            const amenities = bus.amenities || [];

            return (
              <div key={busId} className="bus-card">
                {/* Bus Header */}
                <div className="bus-card-header">
                  <div className="bus-info">
                    <h3>{busName}</h3>
                    <div className="bus-meta">
                      <span className="bus-type-badge">{busType}</span>
                      {timeCategory && (
                        <span 
                          className="time-category-badge"
                          style={{ 
                            backgroundColor: getTimeCategoryColor(timeCategory),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {getTimeCategoryLabel(timeCategory)}
                        </span>
                      )}
                      <span className="coach-number">কোচ: {coachNumber}</span>
                    </div>
                  </div>
                  <div className="bus-fare">
                    <span className="fare-label">ভাড়া</span>
                    <span className="fare-amount">৳{getFare(bus)}</span>
                  </div>
                </div>

                {/* Bus Route */}
                <div className="bus-route">
                  <div className="route-point">
                    <div className="route-location">{searchData.from}</div>
                    <div className="route-time">{getBoardingTime(bus)}</div>
                  </div>
                  
                  <div className="route-line">
                    <div className="route-duration">{calculateDuration(bus)}</div>
                    <div className="route-arrow">→</div>
                  </div>
                  
                  <div className="route-point">
                    <div className="route-location">{searchData.to}</div>
                    <div className="route-time">{getArrivalTime(bus)}</div>
                  </div>
                </div>

                {/* Amenities */}
                {amenities && amenities.length > 0 && (
                  <div className="bus-amenities">
                    {amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="amenity-badge">{amenity}</span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="amenity-badge">+{amenities.length - 4} আরও</span>
                    )}
                  </div>
                )}

                {/* Bus Footer */}
                <div className="bus-card-footer">
                  <div className="seats-info">
                    <span className="seats-available">{availableSeats} আসন</span>
                    <span className="seats-total">/ {totalSeats}</span>
                  </div>
                  <button 
                    className="select-seat-btn"
                    onClick={() => handleSelectSeats(bus)}
                    disabled={availableSeats === 0}
                  >
                    আসন দেখুন
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h3>সাধারণ প্রশ্নাবলী</h3>
        <div className="faq-list">
          <div className="faq-item">
            <h4>কিভাবে টিকেট বুক করবো?</h4>
            <p>বাস নির্বাচন করুন, আসন বাছুন, এবং পেমেন্ট সম্পন্ন করুন।</p>
          </div>
          <div className="faq-item">
            <h4>টিকেট বাতিল করা যাবে?</h4>
            <p>যাত্রার ২৪ ঘণ্টা আগে পর্যন্ত বাতিল করা যাবে।</p>
          </div>
          <div className="faq-item">
            <h4>পেমেন্ট কিভাবে করবো?</h4>
            <p>bKash, Nagad, Rocket বা ক্রেডিট কার্ড দিয়ে পেমেন্ট করতে পারবেন।</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusListPage;