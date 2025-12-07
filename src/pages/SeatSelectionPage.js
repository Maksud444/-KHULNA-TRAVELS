import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get bus and search data from previous page
  const busData = location.state?.bus || {
    id: 1,
    name: 'KHULNA TRAVELS',
    type: 'NON AC',
    coach: 'B-12(ON)',
    startPoint: 'Khulna',
    endPoint: 'Kuakata',
    departureTime: '11:00 PM',
    arrivalTime: '7:15 AM',
    duration: '8h 15m',
    seatsAvailable: 24,
    totalSeats: 40,
    fare: 950,
    amenities: ['Fan', 'Charging', 'Water'],
    rating: 4.5,
    reviews: 156
  };
  
  const searchData = location.state?.searchData || {
    from: 'Khulna',
    to: 'Kuakata',
    journeyDate: new Date().toISOString().split('T')[0]
  };

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [boardingPoint, setBoardingPoint] = useState('');

  // Bus fare
  const farePerSeat = busData.fare;
  const totalFare = selectedSeats.length * farePerSeat;

  // Generate 40 seats (10 rows x 4 columns)
  const generateSeats = () => {
    const seats = [];
    const bookedSeats = ['A3', 'B2', 'C4', 'D1', 'E3']; // Some already booked
    
    for (let row = 0; row < 10; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C...
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${rowLetter}${col}`;
        seats.push({
          number: seatNumber,
          isBooked: bookedSeats.includes(seatNumber),
          isSelected: selectedSeats.includes(seatNumber)
        });
      }
    }
    return seats;
  };

  const allSeats = generateSeats();

  // Handle seat click
  const handleSeatClick = (seatNumber, isBooked) => {
    if (isBooked) {
      alert('This seat is already booked!');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      // Remove seat
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      // Add seat (max 4)
      if (selectedSeats.length >= 4) {
        alert('Maximum 4 seats can be selected');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Handle booking
  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে একটি সিট নির্বাচন করুন');
      return;
    }
    if (!passengerName || !passengerPhone || !boardingPoint) {
      alert('অনুগ্রহ করে সব তথ্য পূরণ করুন');
      return;
    }
    
    // Validate phone number
    if (passengerPhone.length < 11) {
      alert('সঠিক ফোন নম্বর দিন (11 ডিজিট)');
      return;
    }
    
    // Navigate to payment page with all data
    navigate('/payment', {
      state: {
        bus: busData,
        selectedSeats: selectedSeats,
        passengerDetails: {
          name: passengerName,
          phone: passengerPhone,
          boardingPoint: boardingPoint
        },
        searchData: searchData
      }
    });
  };

  // Split seats into rows for display
  const seatRows = [];
  for (let i = 0; i < allSeats.length; i += 4) {
    seatRows.push(allSeats.slice(i, i + 4));
  }

  const boardingPoints = [
    'Apil Gate, Khulna',
    'Boyra Bazar, Khulna',
    'Daulatpur, Khulna',
    'Fulbari Gate, Khulna',
    'Fultola, Khulna',
    'Gallamari, Khulna',
    'Jabusha Chowrasta, Khulna',
    'Katakhali, Khulna'
  ];

  return (
    <div className="seat-selection-page">
      {/* Header */}
      <header className="header-simple">
        <div className="container">
          <div className="logo">🚌 Khulna Travels - Seat Selection</div>
        </div>
      </header>

      {/* Journey Info */}
      <section className="journey-info-section">
        <div className="container">
          <div className="journey-details">
            <span>{searchData.from} → {searchData.to}</span>
            <span>|</span>
            <span>{new Date(searchData.journeyDate).toLocaleDateString('bn-BD')}</span>
            <span>|</span>
            <span>{busData.type}</span>
            <span>|</span>
            <span>৳{busData.fare} per seat</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <div className="layout-grid">
            {/* Left: Seat Layout */}
            <div className="seat-section">
              <h2>Select Your Seats</h2>

              {/* Legend */}
              <div className="legend">
                <div className="legend-item">
                  <div className="seat-box available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="seat-box selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="seat-box booked"></div>
                  <span>Booked</span>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="bus-container">
                {/* Driver */}
                <div className="driver-area">
                  <span>🎛️ Driver</span>
                </div>

                {/* Seats */}
                <div className="seats-area">
                  {seatRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                      {row.map((seat, colIndex) => (
                        <React.Fragment key={seat.number}>
                          <button
                            className={`seat ${
                              seat.isBooked ? 'booked' : 
                              seat.isSelected ? 'selected' : 
                              'available'
                            }`}
                            onClick={() => handleSeatClick(seat.number, seat.isBooked)}
                            disabled={seat.isBooked}
                          >
                            {seat.number}
                          </button>
                          {/* Aisle after 2nd column */}
                          {colIndex === 1 && <div className="aisle-gap"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="booking-section">
              <div className="booking-card">
                <h2>Booking Details</h2>

                {/* Selected Info */}
                <div className="info-box">
                  <div className="info-row">
                    <span>Selected Seats:</span>
                    <strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Number of Seats:</span>
                    <strong className="blue">{selectedSeats.length}</strong>
                  </div>
                  <div className="info-row">
                    <span>Fare per Seat:</span>
                    <strong>৳{farePerSeat}</strong>
                  </div>
                  <div className="info-row total-row">
                    <span>Total Amount:</span>
                    <strong className="total-amount">৳{totalFare}</strong>
                  </div>
                </div>

                {/* Passenger Form */}
                <div className="form-area">
                  <h3>Passenger Details</h3>

                  <div className="input-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Boarding Point *</label>
                    <select 
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                    >
                      <option value="">Select Boarding Point</option>
                      {boardingPoints.map((point, idx) => (
                        <option key={idx} value={point}>{point}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="button-group">
                  <button className="btn-back" onClick={() => window.history.back()}>
                    ← Back
                  </button>
                  <button 
                    className="btn-proceed" 
                    onClick={handleProceed}
                    disabled={selectedSeats.length === 0}
                  >
                    Proceed to Payment →
                  </button>
                </div>

                <p className="terms-text">
                  By proceeding, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default SeatSelectionPage;