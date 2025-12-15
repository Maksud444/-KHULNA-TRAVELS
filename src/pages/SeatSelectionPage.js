import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // HomePage থেকে selection data
  const searchData = location.state?.searchData || {
    from: 'Khulna',
    to: 'Kuakata',
    journeyDate: new Date().toISOString().split('T')[0]
  };

  // BusListPage থেকে selected bus data (BusListPage sends { bus, searchData })
  const selectedBus = useMemo(
    () => location.state?.bus || location.state?.selectedBus || {},
    [location.state]
  );

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // If a bus object was passed from BusListPage, initialize details immediately
  useEffect(() => {
    if (selectedBus && Object.keys(selectedBus).length > 0) {
      setBusDetails({
        busName: selectedBus.name || selectedBus.busName || 'KHULNA TRAVELS',
        operatorName: selectedBus.operator || selectedBus.operatorName || 'KHULNA TRAVELS',
        busType: selectedBus.type || selectedBus.busType || 'Non AC',
        from: searchData.from,
        to: searchData.to,
        startingPoint: selectedBus.startPoint || searchData.from,
        endPoint: selectedBus.endPoint || searchData.to,
        departureTime: selectedBus.departureTime || '৫:০০ AM',
        arrivalTime: selectedBus.arrivalTime || '৮:১৫ AM',
        availableSeats: selectedBus.seatsAvailable || selectedBus.availableSeats || 40,
        fare: selectedBus.fare || selectedBus.price || 500,
        boardingPoints: selectedBus.boardingPoints || [],
        droppingPoints: selectedBus.droppingPoints || []
      });
      setLoading(false);
    }
  }, [selectedBus, searchData.from, searchData.to]);

  // Fetch bus details based on HomePage selection
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setLoading(true);
        
        // API call with HomePage selection
        const response = await fetch(
          `/api/buses/${selectedBus.id || selectedBus.busId || ''}?from=${searchData.from}&to=${searchData.to}&date=${searchData.journeyDate}`
        );
        
        const data = await response.json();
        
        setBusDetails({
          busName: data.busName || selectedBus.name || selectedBus.busName || 'KHULNA TRAVELS',
          operatorName: data.operatorName || selectedBus.operator || selectedBus.operatorName || 'SAKIRA PARIBAHAN',
          busType: data.busType || selectedBus.type || selectedBus.busType || 'Non AC',
          from: searchData.from,
          to: searchData.to,
          startingPoint: data.startingPoint || searchData.from,
          endPoint: data.endPoint || searchData.to,
          departureTime: data.departureTime || selectedBus.departureTime || '৫:০০ AM',
          arrivalTime: data.arrivalTime || selectedBus.arrivalTime || '৮:১৫ AM',
          availableSeats: data.availableSeats || selectedBus.availableSeats || 40,
          fare: data.fare || selectedBus.fare || 500,
          // HomePage selection অনুযায়ী boarding points
          boardingPoints: data.boardingPoints || [],
          // HomePage selection অনুযায়ী dropping points
          droppingPoints: data.droppingPoints || []
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bus details:', error);
        
        // Fallback data with HomePage selections
        setBusDetails({
          busName: selectedBus.busName || 'KHULNA TRAVELS',
          operatorName: selectedBus.operator || 'KHULNA TRAVELS',
          busType: selectedBus.type || 'Non AC',
          from: searchData.from,
          to: searchData.to,
          startingPoint: searchData.from,
          endPoint: searchData.to,
          departureTime: selectedBus.departureTime || '৫:০০ AM',
          arrivalTime: selectedBus.arrivalTime || '৮:১৫ AM',
          availableSeats: selectedBus.availableSeats || 40,
          fare: selectedBus.fare || 500,
          boardingPoints: [],
          droppingPoints: []
        });
        
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [searchData.from, searchData.to, searchData.journeyDate, selectedBus]);

  if (loading || !busDetails) {
    return (
      <div className="seat-selection-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Sample seat layout (4 columns, 10 rows - typical bus layout)
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

  // Seat status (sample data)
  const seatStatus = {
    'A1': 'booked-male',
    'A2': 'booked-female',
    'B3': 'blocked',
    'C1': 'sold-male',
    'D4': 'sold-female',
    'H3': 'blocked',
    // Rest are available by default
  };

  const getSeatStatus = (seat) => {
    if (!seat) return null;
    if (selectedSeats.includes(seat)) return 'selected';
    return seatStatus[seat] || 'available';
  };

  const handleSeatClick = (seat) => {
    if (!seat) return;
    
    const status = getSeatStatus(seat);
    
    // Can't select booked, sold, or blocked seats
    if (status === 'booked-male' || status === 'booked-female' || 
        status === 'sold-male' || status === 'sold-female' || 
        status === 'blocked') {
      return;
    }

    // Toggle selection
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSubmit = () => {
    if (selectedSeats.length === 0) {
      alert('দয়া করে কমপক্ষে একটি সিট নির্বাচন করুন');
      return;
    }

    if (!mobileNumber) {
      alert('দয়া করে মোবাইল নম্বর দিন');
      return;
    }

    if (!boardingPoint || !droppingPoint) {
      alert('দয়া করে বোর্ডিং এবং ড্রপিং পয়েন্ট নির্বাচন করুন');
      return;
    }

    // Navigate to payment page with all data (shape expected by PaymentPage)
    const busToSend = busDetails
      ? { ...busDetails, fare: busDetails.fare || busDetails.amount || 500 }
      : { name: 'KHULNA TRAVELS', fare: 500, type: 'NON AC' };

    navigate('/payment', {
      state: {
        bus: busToSend,
        selectedSeats,
        passengerDetails: {
          name: '',
          phone: mobileNumber,
          boardingPoint,
          droppingPoint
        },
        searchData: searchData,
        totalAmount,
        journeyDate: searchData.journeyDate
      }
    });
  };

  const seatFare = busDetails?.fare || 500;
  const totalAmount = selectedSeats.length * seatFare;

  return (
    <div className="seat-selection-page">
      <div className="container">
        {/* Sort & Filter Bar */}
        <div className="sort-filter-bar">
          <div className="sort-by">
            <span className="sort-icon">☰</span>
            <span className="sort-label">SORT BY</span>
          </div>
          <div className="filter-options">
            <button className="filter-btn">OPERATOR ⇅</button>
            <button className="filter-btn">DEPARTURE TIME ⇅</button>
            <button className="filter-btn">AVAILABLE SEATS ⇅</button>
            <button className="filter-btn">FARE ⇅</button>
            <button className="filter-by-btn">Filter By</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="seat-selection-content">
          {/* Left Side - Bus Info & Seat Map */}
          <div className="left-section">
            <div className="bus-info-card">
              {/* Bus Information Header */}
              <div className="bus-header">
                <div className="bus-name-section">
                  <h2 className="bus-operator">{busDetails.busName}</h2>
                  <p className="bus-route">{busDetails.from} - {busDetails.to}</p>
                  <p className="bus-type">({busDetails.busType})</p>
                  <p className="boarding-info">
                    <span className="info-label">Starting Point:</span> 
                    <span className="info-value">{busDetails.startingPoint}</span>
                  </p>
                  <p className="boarding-info">
                    <span className="info-label">End Point:</span> 
                    <span className="info-value">{busDetails.endPoint}</span>
                  </p>
                </div>

                <div className="time-section">
                  <div className="time-block">
                    <p className="time-label">DEPARTURE TIME</p>
                    <p className="time-value">{busDetails.departureTime}</p>
                  </div>
                  <div className="time-block">
                    <p className="time-label">ARRIVAL TIME</p>
                    <p className="time-value">{busDetails.arrivalTime}</p>
                  </div>
                </div>

                <div className="seats-section">
                  <p className="seats-label">SEATS AVAILABLE</p>
                  <p className="seats-count">{busDetails.availableSeats}</p>
                </div>

                <div className="price-section">
                  <div className="service-charge-badge">No Service Charge</div>
                  <div className="price-display">
                    <span className="currency">৳</span>
                    <span className="amount">{seatFare}.00</span>
                  </div>
                  <button className="hide-seats-btn">Hide Seats</button>
                  <p className="cancellation-policy">Cancellation Policy</p>
                </div>
              </div>

              {/* Seat Legend */}
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="legend-icon selected"></div>
                  <span>SELECTED</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon sold-male"></div>
                  <span>SOLD (M)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon sold-female"></div>
                  <span>SOLD (F)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon booked-male"></div>
                  <span>BOOKED (M)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon booked-female"></div>
                  <span>BOOKED (F)</span>
                </div>
              </div>

              {/* Seat Layout */}
              <div className="seat-map-container">
                <div className="driver-section">
                  <div className="steering-wheel">⚙</div>
                </div>

                <div className="seat-grid">
                  {seatLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                      {row.map((seat, colIndex) => {
                        if (!seat) {
                          return <div key={colIndex} className="seat-gap"></div>;
                        }

                        const status = getSeatStatus(seat);
                        const isClickable = status === 'available' || status === 'selected';

                        return (
                          <div
                            key={colIndex}
                            className={`seat ${status} ${isClickable ? 'clickable' : ''}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Seat ${seat} - ${status}`}
                          >
                            <div className="seat-icon">💺</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator Footer */}
              <div className="operator-footer">
                <p>{busDetails.operatorName}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="right-section">
            <div className="booking-form-card">
              <div className="form-group">
                <label>MOBILE NUMBER*</label>
                <input
                  type="tel"
                  placeholder="মোবাইল নম্বর লিখুন"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  maxLength={11}
                />
              </div>

              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>

              <div className="form-group">
                <label>BOARDING/DROPPING POINT:</label>
                
                <div className="sub-label">BOARDING POINT*</div>
                <select 
                  value={boardingPoint} 
                  onChange={(e) => setBoardingPoint(e.target.value)}
                >
                  <option value="">Select boarding point</option>
                  {busDetails.boardingPoints && busDetails.boardingPoints.length > 0 ? (
                    busDetails.boardingPoints.map((point, index) => (
                      <option key={index} value={point.name || point}>
                        {point.name || point}
                      </option>
                    ))
                  ) : (
                    <option value={busDetails.from}>{busDetails.from}</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <div className="sub-label">DROPPING POINT*</div>
                <select 
                  value={droppingPoint} 
                  onChange={(e) => setDroppingPoint(e.target.value)}
                >
                  <option value="">Select dropping point</option>
                  {busDetails.droppingPoints && busDetails.droppingPoints.length > 0 ? (
                    busDetails.droppingPoints.map((point, index) => (
                      <option key={index} value={point.name || point}>
                        {point.name || point}
                      </option>
                    ))
                  ) : (
                    <option value={busDetails.to}>{busDetails.to}</option>
                  )}
                </select>
              </div>

              {/* Seat Information */}
              <div className="seat-info-box">
                <h3>SEAT INFORMATION:</h3>
                <div className="info-row">
                  <span className="info-label">Seat Fare:</span>
                  <span className="info-value">৳ {seatFare}</span>
                </div>
                            <div className="info-row">
                              <span className="info-label">Departure Time:</span>
                              <span className="info-value">{busDetails.departureTime || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Arrival Time:</span>
                              <span className="info-value">{busDetails.arrivalTime || 'N/A'}</span>
                            </div>
                <div className="info-row">
                  <span className="info-label">Service Charge:</span>
                  <span className="info-value">৳ 0</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Gateway Charge:</span>
                  <span className="info-value">৳ 0</span>
                </div>
              </div>

              {/* Selected Seats Summary */}
              {selectedSeats.length > 0 && (
                <div className="selected-seats-summary">
                  <h3>নির্বাচিত সিট:</h3>
                  <div className="selected-list">
                    {selectedSeats.map((seat, index) => (
                      <span key={index} className="selected-seat-tag">
                        {seat}
                        <button 
                          className="remove-seat"
                          onClick={() => handleSeatClick(seat)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="total-amount">
                    <span>মোট:</span>
                    <span className="amount">৳{totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;