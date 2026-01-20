import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bus, trip, searchData } = location.state || {};
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [roadsMap, setRoadsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

  // Fetch boarding points and roads map
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log('🔄 Fetching boarding points and roads...');

        // Boarding points (fetch all and find by busId)
        try {
          const resp = await fetch(`${API_BASE_URL}/boarding`);
          const data = await resp.json();
          console.log('✅ Boarding Points Response:', data);
          if (data.success && Array.isArray(data.data)) {
            const busPoints = data.data.find(bp => bp.busId && bp.busId._id === bus._id);
            if (busPoints && Array.isArray(busPoints.points)) {
              setBoardingPoints(busPoints.points);
              console.log('📍 Boarding Points:', busPoints.points);
            }
          }
        } catch (e) {
          console.warn('⚠️ Boarding fetch failed:', e);
        }

        // Roads map
        try {
          const rResp = await fetch(`${API_BASE_URL}/road`);
          const rData = await rResp.json();
          console.log('✅ Roads Response:', rData);
          const map = {};
          if (rData.success && Array.isArray(rData.data)) {
            rData.data.forEach(r => {
              if (r._id) map[r._id] = r;
            });
          }
          setRoadsMap(map);
          console.log('🛣️ Roads Map set:', Object.keys(map).length);
        } catch (e) {
          console.warn('⚠️ Roads fetch failed:', e);
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching boarding/roads:', error);
        setLoading(false);
      }
    };

    if (bus && bus._id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [bus]);

  // Seat Layout (10 rows x 4 seats per row)
  const seatLayout = [
    ['A1', 'A2', null, 'A3', 'A4'],
    ['B1', 'B2', null, 'B3', 'B4'],
    ['C1', 'C2', null, 'C3', 'C4'],
    ['D1', 'D2', null, 'D3', 'D4'],
    ['E1', 'E2', null, 'E3', 'E4'],
    ['F1', 'F2', null, 'F3', 'F4'],
    ['G1', 'G2', null, 'G3', 'G4'],
    ['H1', 'H2', null, 'H3', 'H4'],
    ['I1', 'I2', null, 'I3', 'I4'],
    ['J1', 'J2', null, 'J3', 'J4'],
  ];

  // Get seat status
  const getSeatStatus = (seatNumber) => {
    if (!seatNumber) return null;
    
    // Check if seat is booked from trip data
    if (trip?.bookedSeats?.includes(seatNumber)) {
      return 'booked';
    }
    
    // Check if seat is selected by user
    if (selectedSeats.includes(seatNumber)) {
      return 'selected';
    }
    
    return 'available';
  };

  // Handle seat click
  const handleSeatClick = (seatNumber) => {
    if (!seatNumber) return;
    
    const status = getSeatStatus(seatNumber);
    
    // Can't select booked seats
    if (status === 'booked') {
      return;
    }

    // Toggle selection
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Format time
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Determine per-seat fare based on selected drop point (stops.price or trip.fare for main destination)
  const roadId = typeof bus?.roadId === 'string' ? bus.roadId : bus?.roadId?._id;
  const roadInfo = (roadId && roadsMap[roadId]) ? roadsMap[roadId] : (bus?.roadId && typeof bus.roadId === 'object' ? bus.roadId : null);

  const getPerSeatPrice = () => {
    if (!dropPoint) return trip?.fare || 0;
    if (roadInfo) {
      // If dropPoint equals main destination
      if (dropPoint === roadInfo.destination) return trip?.fare || 0;
      const stop = (roadInfo.stops || []).find(s => s.name === dropPoint);
      if (stop && stop.price) return stop.price;
    }
    // Fallback: check bus.roadId stops if roadInfo not available
    const fallbackStops = (bus?.roadId && bus.roadId.stops) || [];
    const f = fallbackStops.find(s => s.name === dropPoint);
    if (f && f.price) return f.price;
    return trip?.fare || 0;
  };

  // Keep per-seat and total in state so they update reliably when seats are selected
  const [perSeatPriceState, setPerSeatPriceState] = useState(trip?.fare || 0);
  const [totalAmountState, setTotalAmountState] = useState(0);

  useEffect(() => {
    const per = getPerSeatPrice();
    setPerSeatPriceState(per);
    setTotalAmountState((selectedSeats.length || 0) * per);
  }, [selectedSeats.length, dropPoint, roadsMap, trip, bus]);

  // Handle confirm booking
  const handleConfirmBooking = () => {
    // Validation
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    if (!boardingPoint) {
      alert('Please select a boarding point');
      return;
    }

    if (!dropPoint) {
      alert('Please select a dropping point');
      return;
    }

    if (!passengerName.trim()) {
      alert('দয়া করে যাত্রীর নাম দিন');
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 11) {
      alert('দয়া করে সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)');
      return;
    }

    // Navigate to payment page
    navigate('/payment', {
      state: {
        bus,
        trip,
        selectedSeats,
        passengerDetails: {
          name: passengerName,
          phone: phoneNumber,
          boardingPoint,
          dropPoint
        },
        totalAmount: totalAmountState,
        perSeatPrice: perSeatPriceState,
        searchData
      }
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!bus || !trip) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>কোন ডেটা পাওয়া যায়নি</h2>
        <button onClick={() => navigate('/')}>হোমপেজে ফিরে যান</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
          
          {/* Left Side - Seat Map */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', background: '#d4edda', border: '2px solid #28a745', borderRadius: '5px' }}></div>
                <span style={{ fontSize: '14px' }}>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', background: '#cce5ff', border: '2px solid #007bff', borderRadius: '5px' }}></div>
                <span style={{ fontSize: '14px' }}>Selected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', background: '#f8d7da', border: '2px solid #dc3545', borderRadius: '5px' }}></div>
                <span style={{ fontSize: '14px' }}>Booked</span>
              </div>
            </div>

            {/* Driver Section */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: '#333', borderRadius: '50%', color: 'white', fontSize: '30px' }}>
                🚗
              </div>
              <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>DRIVER</div>
            </div>

            {/* Seat Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              {seatLayout.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', gap: '10px' }}>
                  {row.map((seat, colIndex) => {
                    if (!seat) {
                      return <div key={colIndex} style={{ width: '50px', height: '50px' }}></div>;
                    }

                    const status = getSeatStatus(seat);
                    let bgColor = '#d4edda';
                    let borderColor = '#28a745';
                    let cursor = 'pointer';

                    if (status === 'selected') {
                      bgColor = '#cce5ff';
                      borderColor = '#007bff';
                    } else if (status === 'booked') {
                      bgColor = '#f8d7da';
                      borderColor = '#dc3545';
                      cursor = 'not-allowed';
                    }

                    return (
                      <div
                        key={colIndex}
                        onClick={() => handleSeatClick(seat)}
                        style={{
                          width: '50px',
                          height: '50px',
                          background: bgColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: cursor,
                          transition: 'all 0.2s',
                          userSelect: 'none'
                        }}
                        onMouseOver={(e) => {
                          if (status !== 'booked') {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {seat}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Selected Seats Info */}
            <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                Selected Seats: <strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Count: <strong>{selectedSeats.length} / {trip.totalSeats}</strong>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Summary */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 'fit-content', position: 'sticky', top: '20px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
              <div style={{ fontSize: '24px' }}>🎫</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#03256c' }}>Booking Summary</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Review & confirm your ticket</div>
              </div>
            </div>

            {/* Bus Info */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#03256c', marginBottom: '8px' }}>
                {bus.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Bus No: {bus.busNumber}
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', marginTop: '10px' }}>
                <div>
                  <div style={{ color: '#888' }}>📅 {formatDate(trip.journeyDate)}</div>
                </div>
                <div>
                  <div style={{ color: '#888' }}>🕐 Departure: {formatTime(trip.departureTime)}</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#03256c' }}>
                Total Amount: ৳{totalAmountState}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Per seat: ৳{perSeatPriceState}
              </div>
            </div>

            {/* Selected Seats */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Selected Seats</div>
              {selectedSeats.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedSeats.map((seat, index) => (
                    <div key={index} style={{ 
                      padding: '6px 12px', 
                      background: '#cce5ff', 
                      border: '1px solid #007bff',
                      borderRadius: '5px', 
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#007bff'
                    }}>
                      {seat}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>No seats selected yet</div>
              )}
            </div>

            {/* Journey Points */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span>
                <span>Journey Points</span>
              </div>

              {/* Boarding Point */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                  Boarding Point *
                </label>
                <select
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select boarding point</option>
                  {boardingPoints.map((point, index) => (
                    <option key={index} value={point.name}>
                      {point.name} - {point.time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drop Point */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                  Drop Point *
                </label>
                <select
                  value={dropPoint}
                  onChange={(e) => setDropPoint(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select drop point</option>
                  {(roadInfo && Array.isArray(roadInfo.stops) ? roadInfo.stops : (bus?.roadId && bus.roadId.stops) || []).map((stop, index) => (
                    <option key={index} value={stop.name}>
                      {stop.name}
                    </option>
                  ))}
                  <option value={(roadInfo && roadInfo.destination) || (bus.roadId && bus.roadId.destination)}>{(roadInfo && roadInfo.destination) || (bus.roadId && bus.roadId.destination)}</option>
                </select>
              </div>
            </div>

            {/* Passenger Details */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
                Passenger Details
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                  Passenger Full Name *
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Enter full name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  maxLength={11}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={selectedSeats.length === 0}
              style={{
                width: '100%',
                padding: '15px',
                background: selectedSeats.length > 0 ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                if (selectedSeats.length > 0) {
                  e.target.style.background = '#0056b3';
                }
              }}
              onMouseOut={(e) => {
                if (selectedSeats.length > 0) {
                  e.target.style.background = '#007bff';
                }
              }}
            >
              <span>✓</span>
              <span>Confirm Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;