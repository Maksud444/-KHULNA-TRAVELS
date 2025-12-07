import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BusListPage.css';

// Import schedule database
import scheduleData from '../src/FINAL-COMPLETE-DATABASE.json';

const BusListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('departure');

  // Get search data from location state
  const searchData = location.state || {
    from: 'Kuakata',
    to: 'Khulna',
    date: new Date().toISOString().split('T')[0]
  };

  // Get schedule type based on FROM and TO
  const getScheduleType = (from, to) => {
    const morningBoarding = scheduleData.schedules.morning.stops
      .filter(stop => stop.type.includes('Boarding'))
      .map(stop => stop.location);
    
    const morningDropping = scheduleData.schedules.morning.stops
      .filter(stop => stop.type.includes('Dropping'))
      .map(stop => stop.location);

    const nightBoarding = scheduleData.schedules.night.stops
      .filter(stop => stop.type.includes('Boarding'))
      .map(stop => stop.location);
    
    const nightDropping = scheduleData.schedules.night.stops
      .filter(stop => stop.type.includes('Dropping'))
      .map(stop => stop.location);

    // Check if route matches morning schedule
    if (morningBoarding.includes(from) && morningDropping.includes(to)) {
      return 'morning';
    }
    
    // Check if route matches night schedule
    if (nightBoarding.includes(from) && nightDropping.includes(to)) {
      return 'night';
    }

    // Default to morning
    return 'morning';
  };

  // Get boarding and dropping times from schedule
  const getScheduleTimes = (from, to) => {
    const scheduleType = getScheduleType(from, to);
    const schedule = scheduleData.schedules[scheduleType];

    // Find boarding time
    const boardingStop = schedule.stops.find(
      stop => stop.location === from && stop.type.includes('Boarding')
    );

    // Find dropping time
    const droppingStop = schedule.stops.find(
      stop => stop.location === to && stop.type.includes('Dropping')
    );

    return {
      departureTime: boardingStop ? boardingStop.time : '09:00 PM',
      arrivalTime: droppingStop ? droppingStop.time : '06:00 AM',
      scheduleType: scheduleType
    };
  };

  // Get price from database
  const getPriceFromDatabase = (from, to) => {
    const priceDb = scheduleData.priceDatabase;
    
    if (priceDb[from] && priceDb[from][to]) {
      return priceDb[from][to];
    }
    
    return 650; // Default price
  };

  // Calculate journey duration
  const calculateDuration = (departure, arrival) => {
    return '6h 30m';
  };

  // Generate buses based on search
  useEffect(() => {
    const generateBuses = () => {
      const price = getPriceFromDatabase(searchData.from, searchData.to);
      const { departureTime, arrivalTime, scheduleType } = getScheduleTimes(
        searchData.from,
        searchData.to
      );
      const duration = calculateDuration(departureTime, arrivalTime);

      // Only 1 bus per schedule
      const generatedBuses = [];

      // Schedule name
      const scheduleName = scheduleType === 'morning' 
        ? 'Morning Schedule' 
        : 'Night Schedule';

      generatedBuses.push({
        id: 1,
        name: 'KHULNA TRAVELS',
        type: 'NON AC',
        coach: 'B-12',
        startPoint: searchData.from,
        endPoint: searchData.to,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: duration,
        fare: price,
        seatsAvailable: 35,
        totalSeats: 40,
        amenities: ['ফ্যান', 'চার্জিং', 'পানি'],
        scheduleType: scheduleName
      });

      setBuses(generatedBuses);
      setFilteredBuses(generatedBuses);
    };

    generateBuses();
  }, [searchData.from, searchData.to]);

  // Filter buses
  useEffect(() => {
    let filtered = [...buses];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(bus => bus.type === filterType);
    }

    // Apply sorting
    if (sortBy === 'departure') {
      filtered.sort((a, b) => {
        const timeA = a.departureTime.replace(/[^0-9]/g, '');
        const timeB = b.departureTime.replace(/[^0-9]/g, '');
        return timeA.localeCompare(timeB);
      });
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.fare - b.fare);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.fare - a.fare);
    } else if (sortBy === 'seats') {
      filtered.sort((a, b) => b.seatsAvailable - a.seatsAvailable);
    }

    setFilteredBuses(filtered);
  }, [buses, filterType, sortBy]);

  const handleSeatSelection = (bus) => {
    navigate('/seat-selection', {
      state: {
        bus: bus,
        searchData: searchData
      }
    });
  };

  return (
    <div className="bus-list-container">
      {/* Header */}
      <div className="bus-list-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← ফিরে যান
          </button>
          <div className="route-info">
            <h1>{searchData.from} → {searchData.to}</h1>
            <p className="journey-date">যাত্রার তারিখ: {searchData.date}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>বাস টাইপ:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">সব বাস</option>
            <option value="AC">AC</option>
            <option value="NON AC">NON AC</option>
          </select>
        </div>

    
      </div>

      {/* Bus List */}
      <div className="bus-list-content">
        <div className="results-info">
          <p>{filteredBuses.length}টি বাস পাওয়া গেছে</p>
        </div>

        {filteredBuses.length > 0 ? (
          <div className="buses-grid">
            {filteredBuses.map((bus) => (
              <div key={bus.id} className="bus-card">
                {/* Schedule Badge */}
                <div className="schedule-badge">
                  {bus.scheduleType}
                </div>

                {/* Bus Card Header */}
                <div className="bus-card-header">
                  <div className="bus-name-section">
                    <h3>{bus.name}</h3>
                    <div>
                      <span className="bus-type-badge">{bus.type}</span>
                      <span className="coach-number">{bus.coach}</span>
                    </div>
                  </div>
                </div>

                {/* Route Info */}
                <div className="bus-route-info">
                  <div className="route-point">
                    <span className="route-icon">📍</span>
                    <div>
                      <div className="location">{bus.startPoint}</div>
                      <div className="time">{bus.departureTime}</div>
                    </div>
                  </div>

                  <div className="route-line">
                    <span className="duration">{bus.duration}</span>
                  </div>

                  <div className="route-point">
                    <span className="route-icon">🏁</span>
                    <div>
                      <div className="location">{bus.endPoint}</div>
                      <div className="time">{bus.arrivalTime}</div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bus-amenities">
                  {bus.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-badge">
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="bus-card-footer">
                  <div className="seats-info">
                    <span className="seats-available">
                      {bus.seatsAvailable} আসন খালি
                    </span>
                    <span className="total-seats">
                      মোট {bus.totalSeats} আসন
                    </span>
                  </div>

                  <div className="fare-section">
                    <span className="fare-label">ভাড়া</span>
                    <span className="fare-amount">৳{bus.fare}</span>
                  </div>

                  <button
                    className="view-seats-btn"
                    onClick={() => handleSeatSelection(bus)}
                  >
                    আসন দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-buses">
            <p>এই রুটে কোনো বাস পাওয়া যায়নি</p>
            <button onClick={() => navigate('/')}>নতুন সার্চ করুন</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusListPage;