import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import './HomePageAnimations.css';

const HomePage = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // API Data States
  const [allFromLocations, setAllFromLocations] = useState([]);
  const [routeMapping, setRouteMapping] = useState({});
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);

  // Hero Images
const heroImages = [
  '/images/Khulnatravelsdual.png',
  '/images/Khulnatravelswhite.png',
  '/images/Khulnatravelsgolden.png'
];


  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    journeyDate: '',
    countType: 'All'
  });

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const announcements = [
    {
      icon: '🚌',
      title: 'Special Notice',
      text: 'Travel times may change due to road congestion, vehicle mechanical issues, and other natural causes.'
    },
    {
      icon: '💳',
      title: 'Payment Offer',
      text: 'Pay with bKash, Nagad, and Card and get special discounts! Book today.'
    },
    {
      icon: '⚠️',
      title: 'Cancellation Policy',
      text: 'To cancel tickets, inform us 24 hours before travel. 10% charge applies.'
    }
  ];

  // Load Buses from API
  useEffect(() => {
    const loadBusesData = async () => {
      try {
        setLoadingRoutes(true);
        setApiError(null);
        
        console.log('🔄 Loading buses from API...');
        console.log('📡 URL:', 'https://backoffice.khulnatravels.net/api/v1/bus');
        
        const response = await fetch('https://backoffice.khulnatravels.net/api/v1/bus');
        const busData = await response.json();
        
        console.log('✅ Bus API response:', busData);
        
        if (!busData.success || !busData.data) {
          throw new Error('Invalid bus data format');
        }

        const buses = busData.data;
        console.log('📊 Total buses:', buses.length);

        // Filter only active buses with valid roadId
        const validBuses = buses.filter(bus => 
          bus.isActive && 
          bus.roadId &&
          bus.roadId.origin &&
          bus.roadId.destination &&
          bus.roadId.status === 'active'
        );

        console.log('✅ Valid active buses:', validBuses.length);

        // Build FROM locations (origins) from buses
        const fromLocationsSet = new Set();
        validBuses.forEach(bus => {
          const origin = bus.roadId.origin;
          if (origin) {
            fromLocationsSet.add(origin.trim().toLowerCase());
          }
        });
        
        const fromLocations = Array.from(fromLocationsSet).sort();
        console.log('📍 FROM locations (Origins):', fromLocations);
        setAllFromLocations(fromLocations);

        // Build route mapping: FROM -> [TO destinations]
        const mapping = {};
        
        validBuses.forEach(bus => {
          const origin = bus.roadId.origin.trim().toLowerCase();
          const destination = bus.roadId.destination.trim().toLowerCase();

          // Initialize origin in mapping
          if (!mapping[origin]) {
            mapping[origin] = new Set();
          }

          // Add only main destination (not stops)
          mapping[origin].add(destination);
        });

        // Convert Sets to Arrays and sort
        Object.keys(mapping).forEach(origin => {
          mapping[origin] = Array.from(mapping[origin]).sort();
        });

        console.log('🗺️ Route mapping:', mapping);
        setRouteMapping(mapping);

        // Build popular routes for display
        const routesForDisplay = [];
        const seenRoutes = new Set();

        validBuses.forEach(bus => {
          const origin = bus.roadId.origin.trim().toLowerCase();
          const destination = bus.roadId.destination.trim().toLowerCase();
          const routeKey = `${origin}-${destination}`;

          // Add only main destination routes (not stop routes)
          if (!seenRoutes.has(routeKey)) {
            routesForDisplay.push({
              from: origin,
              to: destination,
              busName: bus.name,
              roadName: bus.roadId.roadName,
              thumbnail: bus.thumbnail,
              timings: bus.timings
            });
            seenRoutes.add(routeKey);
          }
        });
        
        setPopularRoutes(routesForDisplay.slice(0, 6));
        console.log('✅ Popular routes:', routesForDisplay.slice(0, 6));
        console.log('✅ Buses loaded successfully!');
        
      } catch (error) {
        console.error('❌ Load Error:', error);
        setApiError(error.message);
        
        // Fallback data
        console.log('⚠️ Using fallback data');
        const fallback = {
          'kuakata': ['khulna'],
          'jossore': ['kuakata', 'khulna', 'rupdia', 'boshundia']
        };
        
        setAllFromLocations(Object.keys(fallback).sort());
        setRouteMapping(fallback);
        setPopularRoutes([
          { from: 'kuakata', to: 'khulna', busName: 'Khulna Travels' },
          { from: 'jossore', to: 'kuakata', busName: 'Khulna Travels' },
          { from: 'jossore', to: 'khulna', busName: 'Khulna Travels' }
        ]);
      } finally {
        setLoadingRoutes(false);
      }
    };

    loadBusesData();
  }, []);

  const getToLocations = (from) => {
    if (!from) return [];
    return routeMapping[from.toLowerCase()] || [];
  };

  const availableToLocations = getToLocations(searchData.from);

  // Auto slide images
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const target = 125847;
    const duration = 2000;
    const steps = 50;
    const increment = target / steps;
    let current = 0;

    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        setTicketCount(target);
        clearInterval(counter);
      } else {
        setTicketCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(counter);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 1000);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const swapLocations = () => {
    const newFrom = searchData.to;
    const newTo = searchData.from;
    
    const newToLocations = getToLocations(newFrom);
    if (newFrom && newToLocations.includes(newTo.toLowerCase())) {
      setSearchData({
        ...searchData,
        from: newFrom,
        to: newTo
      });
    } else {
      setSearchData({
        ...searchData,
        from: newFrom,
        to: ''
      });
    }
  };

  const handleFromSelect = (location) => {
    setSearchData({
      ...searchData,
      from: location,
      to: ''
    });
    setShowFromDropdown(false);
  };

  const handleToSelect = (location) => {
    setSearchData({
      ...searchData,
      to: location
    });
    setShowToDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchData.from || !searchData.to || !searchData.journeyDate) {
      alert('Please fill in all information');
      return;
    }

    if (searchData.from.toLowerCase() === searchData.to.toLowerCase()) {
      alert('Starting point and destination cannot be the same');
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      navigate('/bus-list', { 
        state: {
          from: searchData.from,
          to: searchData.to,
          date: searchData.journeyDate
        }
      });
    }, 1500);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const faqItems = [
    {
      question: 'Which routes does Khulna Travels operate on?',
      answer: 'Khulna Travels provides bus services to 39 destinations including Kuakata, Patuakhali, Barisal from Khulna, Jessore, Noapara.'
    },
    {
      question: 'What is the ticket price?',
      answer: 'Ticket prices vary by route and bus type. Generally from 150 taka to 950 taka.'
    },
    {
      question: 'Where are the boarding points?',
      answer: 'There are 8 boarding points in Khulna - Apil Gate, Boyra Bazar, Daulatpur, Fulbari Gate, etc.'
    },
    {
      question: 'How to book tickets online?',
      answer: 'Go to our website, select route and date, choose bus and seat, enter details and make payment.'
    },
    {
      question: 'What is the ticket cancellation policy?',
      answer: 'Tickets must be cancelled 24 hours before travel. 10% cancellation charge and payment gateway charge apply.'
    },
    {
      question: 'What facilities are available on the bus?',
      answer: 'Our buses have comfortable seats, charging points, water, and safe travel.'
    }
  ];

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="homepage-professional">
      {showNotification && (
        <div className="toast-notification">
          <span className="toast-icon">🎉</span>
          <span>Welcome! Book today with special discounts!</span>
        </div>
      )}

      <div className="top-info-bar">
        <div className="container">
          <div className="info-bar-content">
            <div className="info-item">
              <span className="icon">📞</span>
              <span>Hotline: 01834201628</span>
            </div>
            <div className="info-item">
              <span className="icon">📧</span>
              <span>info@khulnatravels.com</span>
            </div>
            <div className="info-item live-time">
              <span className="icon pulse">🕐</span>
              <span>{formatTime(currentDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="announcement-ticker">
        <div className="container">
          <div className="ticker-wrapper">
            <span className="ticker-label">📢 Notice:</span>
            <div className="ticker-content">
              {announcements.map((item, index) => (
                <div
                  key={index}
                  className={`ticker-item ${index === activeAnnouncement ? 'active' : ''}`}
                >
                  <span className="ticker-icon">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="hero-pro">
        <div className="hero-carousel">
          <div className="carousel-container">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="carousel-overlay"></div>
              </div>
            ))}
          </div>

          <button className="carousel-arrow prev" onClick={prevSlide}>‹</button>
          <button className="carousel-arrow next" onClick={nextSlide}>›</button>

          <div className="carousel-dots">
            {heroImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </div>

        <div className="container">
          <div className="hero-content-pro">
            <h1 className="hero-title">Online Ticketing Made Easy!</h1>
            <p className="hero-subtitle">Book your bus tickets easily from anywhere in the country</p>

            <div className="live-stats">
              <div className="stat-card">
                <div className="stat-number">{ticketCount.toLocaleString('bn-BD')}</div>
                <div className="stat-label">Ticket Sales</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">১০০+</div>
                <div className="stat-label">Bus Operators</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">৩৯+</div>
                <div className="stat-label">Destination Cities</div>
              </div>
            </div>

            {loadingRoutes ? (
              <div className="loading-routes" style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '10px',
                marginTop: '30px'
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #03256c',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{marginTop: '20px', fontSize: '16px', color: '#03256c'}}>
                  Routes loading...
                </p>
              </div>
            ) : (
              <form className="search-form-pro" onSubmit={handleSearch}>
                <div className="form-grid">
                  <div className="form-field">
                    <label>From</label>
                    <div className="dropdown-wrapper">
                      <input
                        type="text"
                        placeholder="Starting Location"
                        value={searchData.from}
                        onFocus={() => setShowFromDropdown(true)}
                        onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                        onChange={(e) => setSearchData({ ...searchData, from: e.target.value, to: '' })}
                        required
                      />
                      {showFromDropdown && (
                        <div className="dropdown-menu">
                          {allFromLocations
                            .filter(loc => loc.toLowerCase().includes(searchData.from.toLowerCase()))
                            .map((location, idx) => (
                              <div
                                key={idx}
                                className="dropdown-item"
                                onClick={() => handleFromSelect(location)}
                              >
                                <span className="location-icon">📍</span>
                                {capitalizeFirst(location)}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="swap-button-wrapper">
                    <button
                      type="button"
                      className="swap-btn-pro"
                      onClick={swapLocations}
                      title="Swap Locations"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M17 14L12 9L7 14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>

                  <div className="form-field">
                    <label>To</label>
                    <div className="dropdown-wrapper">
                      <input
                        type="text"
                        placeholder={searchData.from ? "Select Destination" : "Select Starting Location First"}
                        value={searchData.to}
                        onFocus={() => searchData.from && setShowToDropdown(true)}
                        onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                        onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                        disabled={!searchData.from}
                        required
                      />
                      {showToDropdown && searchData.from && (
                        <div className="dropdown-menu">
                          {availableToLocations.length > 0 ? (
                            availableToLocations
                              .filter(loc => loc.toLowerCase().includes(searchData.to.toLowerCase()))
                              .map((location, idx) => (
                                <div
                                  key={idx}
                                  className="dropdown-item"
                                  onClick={() => handleToSelect(location)}
                                >
                                  <span className="location-icon">📍</span>
                                  {capitalizeFirst(location)}
                                </div>
                              ))
                          ) : (
                            <div className="dropdown-item disabled">
                              <span className="location-icon">❌</span>
                              No routes available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Travel Date</label>
                    <input
                      type="date"
                      value={searchData.journeyDate}
                      onChange={(e) => setSearchData({ ...searchData, journeyDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="search-btn-pro"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <span className="spinner"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <span className="icon">🔍</span>
                        Search Buses
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="quick-stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">🎫</div>
              <div className="stat-info">
                <div className="stat-value">৫০০০+</div>
                <div className="stat-title">Daily Tickets</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">৪.৮/৫.০</div>
                <div className="stat-title">Customer Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🚌</div>
              <div className="stat-info">
                <div className="stat-value">৫০+</div>
                <div className="stat-title">Number of Buses</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">😊</div>
              <div className="stat-info">
                <div className="stat-value">১ লক্ষ+</div>
                <div className="stat-title">Satisfied Passengers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="routes-section-pro" id="routes">
        <div className="container">
          <div className="section-header-pro">
            <h2 className="section-title-pro">Our Bus Routes</h2>
            <p className="section-subtitle-pro">
              Khulna Travels provides regular bus services on various important routes in Bangladesh
            </p>
          </div>

          <div className="routes-grid-pro">
            {popularRoutes.map((route, idx) => (
              <div key={idx} className="route-card-pro">
                <div className="route-badge">Popular</div>
                <div className="route-path">
                  <span className="route-from">{capitalizeFirst(route.from)}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{capitalizeFirst(route.to)}</span>
                </div>
                <div className="route-details">
                  <div className="route-info-item">
                    <span className="info-icon">🚌</span>
                    <span>{route.busName}</span>
                  </div>
                  <div className="route-info-item">
                    <span className="info-icon">⏱️</span>
                    <span>Daily Service</span>
                  </div>
                </div>
                <button 
                  className="route-book-btn"
                  onClick={() => {
                    setSearchData({
                      ...searchData,
                      from: route.from,
                      to: route.to
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="payment-section-pro">
        <div className="container">
          <div className="section-header-pro">
            <h2 className="section-title-pro">Payment Methods</h2>
            <p className="section-subtitle-pro">We accept all types of payments</p>
          </div>
          <div className="payment-image-wrapper">
            <img 
              src="/images/payment-methods.png" 
              alt="Payment Methods"
              className="payment-methods-img"
            />
          </div>
        </div>
      </section>

      <section className="faq-section-pro">
        <div className="container">
          <div className="section-header-pro">
            <h2 className="section-title-pro">Frequently Asked Questions</h2>
            <p className="section-subtitle-pro">Find answers to your questions here</p>
          </div>

          <div className="faq-container-pro">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item-pro ${expandedFaq === idx ? 'active' : ''}`}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <div className="faq-question-pro">
                  <span>{item.question}</span>
                  <span className="faq-icon">{expandedFaq === idx ? '−' : '+'}</span>
                </div>
                {expandedFaq === idx && (
                  <div className="faq-answer-pro">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;