import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusListPage.css';

const BusListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || {};

  const [busesWithTrips, setBusesWithTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  


  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // Fetch trips and group by bus
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching trips from API...');
        console.log('📍 Search Data:', searchData);

        const url = `${API_BASE_URL}/trip`;
        console.log('📡 API URL:', url);

        const response = await fetch(url);
        console.log('📥 Response Status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Full API Response:', data);

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch trips');
        }

        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid data format');
        }

        const trips = data.data;
        console.log('📊 Total trips:', trips.length);
        console.log('📊 First trip:', trips[0]);

        // Filter trips based on search criteria
        let filteredTrips = trips;

        // Filter by origin and destination
        if (searchData.from || searchData.to) {
          filteredTrips = trips.filter(trip => {
            if (!trip.busId || !trip.busId.roadId) return false;

            const origin = trip.busId.roadId.origin?.toLowerCase();
            const destination = trip.busId.roadId.destination?.toLowerCase();
            
            const fromMatch = !searchData.from || origin === searchData.from.toLowerCase();
            const toMatch = !searchData.to || destination === searchData.to.toLowerCase();

            return fromMatch && toMatch;
          });

          console.log(`🔍 Filtered by route: ${filteredTrips.length} trips`);
        }

        // Filter by date
        if (searchData.date) {
          filteredTrips = filteredTrips.filter(trip => {
            if (!trip.journeyDate) return false;
            const tripDate = new Date(trip.journeyDate).toISOString().split('T')[0];
            const searchDate = new Date(searchData.date).toISOString().split('T')[0];
            return tripDate === searchDate;
          });

          console.log(`🔍 Filtered by date: ${filteredTrips.length} trips`);
        }

        // Filter only active trips
        filteredTrips = filteredTrips.filter(trip => trip.isActive === true);
        console.log(`🔍 Active trips: ${filteredTrips.length}`);

        // Group trips by busId
        const grouped = groupTripsByBus(filteredTrips);
        console.log('🚌 Grouped buses:', grouped.length);
        
        setBusesWithTrips(grouped);
        setLoading(false);

      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message || 'Failed to load trips');
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchData.from, searchData.to, searchData.date]);

  // Group trips by bus
  const groupTripsByBus = (trips) => {
    const busGroups = {};
    
    trips.forEach(trip => {
      if (!trip.busId || !trip.busId._id) {
        console.warn('⚠️ Trip without busId:', trip._id);
        return;
      }

      const busId = trip.busId._id;
      
      if (!busGroups[busId]) {
        busGroups[busId] = {
          busId: busId,
          busName: trip.busId.name,
          busNumber: trip.busId.busNumber,
          coachNumber: trip.busId.coachNumber,
          capacity: trip.busId.capacity,
          thumbnail: trip.busId.thumbnail,
          timings: trip.busId.timings || [],
          roadId: trip.busId.roadId,
          driver: trip.busId.driver,
          supervisor: trip.busId.supervisor,
          trips: []
        };
      }

      busGroups[busId].trips.push({
        _id: trip._id,
        journeyDate: trip.journeyDate,
        departureTime: trip.departureTime,
        totalSeats: trip.totalSeats,
        bookedSeats: trip.bookedSeats || [],
        availableSeats: trip.totalSeats - (trip.bookedSeats?.length || 0),
        fare: trip.fare,
        isActive: trip.isActive,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt
      });
    });

    return Object.values(busGroups);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format time to 12-hour
  const formatTime = (time) => {
    if (!time) return 'N/A';
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    } catch (e) {
      return time;
    }
  };

  // Calculate arrival time
  const calculateArrivalTime = (departureTime, roadStops) => {
    if (!departureTime) return 'N/A';
    
    // If stops available, use last stop time
    if (roadStops && roadStops.length > 0) {
      const lastStop = roadStops[roadStops.length - 1];
      if (lastStop.time) {
        return formatTime(lastStop.time);
      }
    }
    
    // Otherwise, estimate +6 hours
    try {
      const [hours, minutes] = departureTime.split(':').map(Number);
      const arrivalHours = (hours + 6) % 24;
      return formatTime(`${String(arrivalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    } catch (e) {
      return 'N/A';
    }
  };

  // Get time category
  const getTimeCategory = (departureTime) => {
    if (!departureTime) return '';
    
    try {
      const [hours] = departureTime.split(':').map(Number);
      
      if (hours >= 6 && hours < 12) return 'morning';
      if (hours >= 12 && hours < 17) return 'afternoon';
      if (hours >= 17 && hours < 21) return 'evening';
      return 'night';
    } catch (e) {
      return '';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night'
    };
    return labels[category] || '';
  };

  const getCategoryColor = (category) => {
    const colors = {
      morning: '#4caf50',
      afternoon: '#ff9800',
      evening: '#f44336',
      night: '#9c27b0'
    };
    return colors[category] || '#757575';
  };

  // Get all buses (no filtering)
  const getFilteredBuses = () => {
    return busesWithTrips;
  };

  // Handle seat selection
  const handleSelectSeats = (bus, trip) => {
    navigate('/seat-selection', {
      state: {
        bus: {
          _id: bus.busId,
          name: bus.busName,
          busNumber: bus.busNumber,
          coachNumber: bus.coachNumber,
          capacity: bus.capacity,
          thumbnail: bus.thumbnail,
          roadId: bus.roadId,
          driver: bus.driver,
          supervisor: bus.supervisor
        },
        trip: {
          _id: trip._id,
          journeyDate: trip.journeyDate,
          departureTime: trip.departureTime,
          totalSeats: trip.totalSeats,
          bookedSeats: trip.bookedSeats,
          availableSeats: trip.availableSeats,
          fare: trip.fare
        },
        searchData: searchData
      }
    });
  };

  const filteredBuses = getFilteredBuses();

  if (loading) {
    return (
      <div className="bus-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for buses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bus-list-page">
        <div className="error-container">
          <h3>Sorry, something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go back to homepage</button>
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
            {searchData.from || 'Any place'} → {searchData.to || 'Any place'}
          </h2>
          <p>
            {searchData.date ? formatDate(searchData.date) : 'All dates'}
          </p>
        </div>
        <button 
          className="modify-search-btn"
          onClick={() => navigate('/')}
        >
          Change search
        </button>
      </div>



      {/* Results Count */}
      <div className="results-count">
        <p>{filteredBuses.length} buses found</p>
      </div>

      {/* Bus List */}
      <div className="bus-list">
        {filteredBuses.length === 0 ? (
          <div className="no-buses">
            <h3>No buses found</h3>
            <p>Try changing route or date</p>
            <button onClick={() => navigate('/')}>Search again</button>
          </div>
        ) : (
          filteredBuses.map((bus) => (
            <div key={bus.busId} className="bus-card">
              {/* Bus Header */}
              <div className="bus-card-header">
                <div className="bus-info">
                  <div className="bus-thumbnail">
                    {bus.thumbnail ? (
                      <img src={bus.thumbnail} alt={bus.busName} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                    ) : (
                      <div className="bus-icon" style={{width: '80px', height: '80px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>🚌</div>
                    )}
                  </div>
                  <div style={{marginLeft: '15px'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '20px', color: '#03256c'}}>{bus.busName}</h3>
                    <div className="bus-meta" style={{display: 'flex', gap: '15px', fontSize: '14px', color: '#666'}}>
                      <span>Coach: {bus.coachNumber}</span>
                      <span>Bus No: {bus.busNumber}</span>
                      <span>Capacity: {bus.capacity} seats</span>
                    </div>
                    {bus.roadId && (
                      <div style={{marginTop: '5px', fontSize: '13px', color: '#888'}}>
                        Route: {bus.roadId.origin} → {bus.roadId.destination}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trips List */}
              <div className="trips-list" style={{marginTop: '20px'}}>
                <div className="trips-header" style={{background: '#f5f5f5', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px'}}>
                  <h4 style={{margin: 0, fontSize: '16px', color: '#03256c'}}>Available trips ({bus.trips.length})</h4>
                </div>

                {bus.trips.map((trip) => {
                  const arrivalTime = calculateArrivalTime(trip.departureTime, bus.roadId?.stops);
                  
                  return (
                    <div 
                      key={trip._id} 
                      className="trip-row" 
                      onClick={() => handleSelectSeats(bus, trip)}
                      style={{
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        marginBottom: '15px', 
                        background: '#fff',
                        cursor: trip.availableSeats > 0 ? 'pointer' : 'not-allowed',
                        opacity: trip.availableSeats > 0 ? 1 : 0.6,
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        if (trip.availableSeats > 0) {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Route */}
                      <div style={{marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0'}}>
                        <div style={{fontSize: '13px', color: '#888', marginBottom: '5px'}}>Route</div>
                        <div style={{fontSize: '18px', fontWeight: 'bold', color: '#03256c'}}>
                          {bus.roadId?.origin || searchData.from} → {bus.roadId?.destination || searchData.to}
                        </div>
                      </div>

                      {/* Times */}
                      <div style={{display: 'flex', gap: '30px', marginBottom: '15px', flexWrap: 'wrap'}}>
                        <div>
                          <div style={{fontSize: '13px', color: '#888', marginBottom: '5px'}}>Departure time</div>
                          <div style={{fontSize: '20px', fontWeight: 'bold', color: '#03256c'}}>
                            {formatTime(trip.departureTime)}
                          </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', color: '#ccc', fontSize: '24px'}}>→</div>
                        <div>
                          <div style={{fontSize: '13px', color: '#888', marginBottom: '5px'}}>Arrival time</div>
                          <div style={{fontSize: '20px', fontWeight: 'bold', color: '#03256c'}}>
                            {arrivalTime}
                          </div>
                        </div>
                      </div>

                      {/* Journey Date */}
                      <div style={{marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px'}}>
                        <span style={{fontSize: '13px', color: '#888'}}>📅 Journey date: </span>
                        <span style={{fontSize: '15px', fontWeight: '600', color: '#333'}}>
                          {formatDate(trip.journeyDate)}
                        </span>
                      </div>

                      {/* Seats and Fare */}
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                        <div style={{display: 'flex', gap: '25px', alignItems: 'center'}}>
                          <div>
                            <span style={{fontSize: '13px', color: '#888'}}>🪑 Available seats: </span>
                            <span style={{fontSize: '18px', fontWeight: 'bold', color: trip.availableSeats > 0 ? '#4caf50' : '#f44336'}}>
                              {trip.availableSeats}
                            </span>
                          </div>
                          <div>
                            <span style={{fontSize: '13px', color: '#888'}}>💺 Total seats: </span>
                            <span style={{fontSize: '18px', fontWeight: 'bold', color: '#333'}}>
                              {trip.totalSeats}
                            </span>
                          </div>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                          <div style={{textAlign: 'right'}}>
                            <div style={{fontSize: '13px', color: '#888'}}>Fare</div>
                            <div style={{fontSize: '28px', fontWeight: 'bold', color: '#03256c'}}>
                              ৳{trip.fare}
                            </div>
                          </div>
                          <div style={{
                            background: trip.availableSeats > 0 ? '#4caf50' : '#ccc',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {trip.availableSeats > 0 ? 'View seats →' : 'No seats'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver/Supervisor Info - Removed */}
            </div>
          ))
        )}
      </div>

      {/* FAQ Section */}
      <div className="faq-section" style={{marginTop: '40px', padding: '30px', background: '#f9f9f9', borderRadius: '10px'}}>
        <h3 style={{marginBottom: '20px', color: '#03256c'}}>Frequently Asked Questions</h3>
        <div className="faq-list">
          <div className="faq-item" style={{marginBottom: '15px'}}>
            <h4 style={{color: '#333', marginBottom: '8px'}}>How to book tickets?</h4>
            <p style={{color: '#666', margin: 0}}>Select bus, choose seats, and complete payment.</p>
          </div>
          <div className="faq-item" style={{marginBottom: '15px'}}>
            <h4 style={{color: '#333', marginBottom: '8px'}}>Can tickets be cancelled?</h4>
            <p style={{color: '#666', margin: 0}}>Can be cancelled up to 24 hours before journey.</p>
          </div>
          <div className="faq-item">
            <h4 style={{color: '#333', marginBottom: '8px'}}>How to make payment?</h4>
            <p style={{color: '#666', margin: 0}}>You can pay with bKash, Nagad, Rocket or credit card.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusListPage;