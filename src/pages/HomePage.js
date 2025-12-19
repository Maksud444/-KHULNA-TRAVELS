import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { api } from '../services/api';

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

  // Hero Images
  const heroImages = [
    '/images/Khulnatravelsgolden.png',
    '/images/Khulnatravelswhite.png',
    '/images/Khulnatravelsdual.png'
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
      title: 'বিশেষ বিজ্ঞপ্তি',
      text: 'রাস্তায় সৃষ্ট জ্যামের কারণে ও গাড়ির যান্ত্রিক ত্রুটি এবং অন্যান্য প্রাকৃতিক কারণে যাত্রার সময় পরিবর্তন হতে পারে।'
    },
    {
      icon: '💳',
      title: 'পেমেন্ট অফার',
      text: 'bKash, Nagad এবং Card এ পেমেন্ট করুন এবং পান বিশেষ ছাড়! আজই বুক করুন।'
    },
    {
      icon: '⚠️',
      title: 'Cancel Policy',
      text: 'টিকেট বাতিল করতে চাইলে যাত্রার ২৪ ঘন্টা আগে জানাতে হবে। ১০% চার্জ প্রযোজ্য।'
    }
  ];

  // Load Routes from API with comprehensive error handling
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoadingRoutes(true);
        setApiError(null);
        
        console.log('🔄 Loading routes from API...');
        console.log('📡 URL:', 'https://backoffice.khulnatravels.net/api/v1/road');
        
        const response = await api.routes.getAll();
        
        console.log('✅ Raw API response:', response);
        console.log('📊 Response type:', typeof response);
        console.log('📊 Is Array?', Array.isArray(response));
        
        // Handle different response formats
        let routes = [];
        
        if (Array.isArray(response)) {
          // Format 1: Direct array
          routes = response;
          console.log('✅ Format: Direct array');
        } else if (response && Array.isArray(response.data)) {
          // Format 2: {data: [...]}
          routes = response.data;
          console.log('✅ Format: {data: [...]}');
        } else if (response && Array.isArray(response.routes)) {
          // Format 3: {routes: [...]}
          routes = response.routes;
          console.log('✅ Format: {routes: [...]}');
        } else if (response && response.success && Array.isArray(response.data)) {
          // Format 4: {success: true, data: [...]}
          routes = response.data;
          console.log('✅ Format: {success: true, data: [...]}');
        } else {
          console.error('❌ Unknown response format:', response);
          throw new Error('Unknown API response format');
        }
        
        console.log('✅ Extracted routes:', routes);
        console.log('📊 Number of routes:', routes.length);
        
        if (!routes || routes.length === 0) {
          throw new Error('No routes found');
        }

        // Build FROM locations list
        const fromLocs = [...new Set(routes.map(route => route.from || route.from_location))];
        console.log('📍 FROM locations:', fromLocs);
        setAllFromLocations(fromLocs.sort());

        // Build route mapping
        const mapping = {};
        routes.forEach(route => {
          const from = route.from || route.from_location;
          const to = route.to || route.to_location;
          
          if (!from || !to) {
            console.warn('⚠️ Invalid route:', route);
            return;
          }
          
          if (!mapping[from]) {
            mapping[from] = [];
          }
          if (!mapping[from].includes(to)) {
            mapping[from].push(to);
          }
        });

        console.log('🗺️ Route mapping:', mapping);
        setRouteMapping(mapping);
        
        console.log('✅ Routes loaded successfully!');
        console.log('✅ Total FROM cities:', Object.keys(mapping).length);
      } catch (error) {
        console.error('❌ Load Error:', error);
        console.error('❌ Error message:', error.message);
        
        setApiError(error.message);
        
        // Fallback data
        console.log('⚠️ Using fallback data');
        const fallback = {
          'Kuakata': ['Khulna', 'Noapara', 'Jessore'],
          'Khulna': ['Kuakata', 'Barishal', 'Patuakhali', 'Jhalokathi'],
          'Jessore': ['Kuakata', 'Barishal', 'Jhalokathi'],
          'Noapara': ['Kuakata', 'Barishal', 'Jhalokathi'],
          'Barishal': ['Khulna', 'Kuakata'],
          'Patuakhali': ['Khulna', 'Kuakata'],
          'Bagerhat': ['Kuakata', 'Jhalokathi', 'Barishal'],
          'Pirojpur': ['Kuakata', 'Barishal', 'Jhalokathi'],
          'Jhalokathi': ['Kuakata', 'Barishal']
        };
        
        setAllFromLocations(Object.keys(fallback).sort());
        setRouteMapping(fallback);
      } finally {
        setLoadingRoutes(false);
      }
    };

    loadRoutes();
  }, []);

  const getToLocations = (from) => {
    if (!from) return [];
    return routeMapping[from] || [];
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
    if (newFrom && newToLocations.includes(newTo)) {
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
      alert('দয়া করে সব তথ্য পূরণ করুন');
      return;
    }

    if (searchData.from === searchData.to) {
      alert('শুরু এবং গন্তব্য একই হতে পারবে না');
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
      question: 'কোন কোন রুটে খুলনা ট্রাভেলস বাস চলাচল করে?',
      answer: 'খুলনা ট্রাভেলস খুলনা, যশোর, নোয়াপাড়া থেকে কুয়াকাটা, পটুয়াখালী, বরিশাল সহ ৩৯টি গন্তব্যে বাস সেবা প্রদান করে।'
    },
    {
      question: 'টিকিটের মূল্য কত?',
      answer: 'টিকিটের মূল্য রুট এবং বাসের ধরন অনুযায়ী ভিন্ন হয়। সাধারণত ১৫০ টাকা থেকে ৯৫০ টাকা পর্যন্ত।'
    },
    {
      question: 'বোর্ডিং পয়েন্ট কোথায়?',
      answer: 'খুলনায় ৮টি বোর্ডিং পয়েন্ট রয়েছে - আপিল গেইট, বয়রা বাজার, দৌলতপুর, ফুলবাড়ী গেট ইত্যাদি।'
    },
    {
      question: 'অনলাইনে টিকেট বুক করার নিয়ম কি?',
      answer: 'আমাদের ওয়েবসাইটে গিয়ে যাত্রাপথ ও তারিখ নির্বাচন করুন, বাস ও সিট বেছে নিন, তথ্য দিয়ে পেমেন্ট করুন।'
    },
    {
      question: 'টিকেট বাতিল করার নিয়ম কি?',
      answer: 'যাত্রার ২৪ ঘন্টা আগে টিকেট বাতিল করতে হবে। ১০% বাতিল চার্জ এবং পেমেন্ট গেটওয়ে চার্জ প্রযোজ্য।'
    },
    {
      question: 'বাসে কি সুবিধা পাওয়া যায়?',
      answer: 'আমাদের বাসে রয়েছে আরামদায়ক সিট, চার্জিং পয়েন্ট, পানি এবং নিরাপদ যাত্রা।'
    }
  ];

  return (
    <div className="homepage-professional">
      {showNotification && (
        <div className="toast-notification">
          <span className="toast-icon">🎉</span>
          <span>স্বাগতম! আজই বুক করুন বিশেষ ছাড়ে!</span>
        </div>
      )}

      <div className="top-info-bar">
        <div className="container">
          <div className="info-bar-content">
            <div className="info-item">
              <span className="icon">📞</span>
              <span>হটলাইন: ০১৮৩৪২০১৬২৮</span>
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
            <span className="ticker-label">📢 বিজ্ঞপ্তি:</span>
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
            <h1 className="hero-title">অনলাইন টিকেটিং সহজ হয়েছে!</h1>
            <p className="hero-subtitle">দেশের যেকোনো প্রান্ত থেকে সহজেই বুক করুন আপনার বাস টিকেট</p>

            <div className="live-stats">
              <div className="stat-card">
                <div className="stat-number">{ticketCount.toLocaleString('bn-BD')}</div>
                <div className="stat-label">টিকেট বিক্রি</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">১০০+</div>
                <div className="stat-label">বাস অপারেটর</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">৩৯+</div>
                <div className="stat-label">গন্তব্য শহর</div>
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
                  রুট লোড হচ্ছে...
                </p>
              </div>
            ) : (
              <form className="search-form-pro" onSubmit={handleSearch}>
                <div className="form-grid">
                  <div className="form-field">
                    <label>কোথা থেকে</label>
                    <div className="dropdown-wrapper">
                      <input
                        type="text"
                        placeholder="শুরুর স্থান"
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
                                {location}
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
                      title="স্থান পরিবর্তন করুন"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M17 14L12 9L7 14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>

                  <div className="form-field">
                    <label>কোথায়</label>
                    <div className="dropdown-wrapper">
                      <input
                        type="text"
                        placeholder={searchData.from ? "গন্তব্য নির্বাচন করুন" : "প্রথমে শুরুর স্থান নির্বাচন করুন"}
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
                                  {location}
                                </div>
                              ))
                          ) : (
                            <div className="dropdown-item disabled">
                              <span className="location-icon">❌</span>
                              কোন রুট উপলব্ধ নেই
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label>যাত্রার তারিখ</label>
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
                        খুঁজছি...
                      </>
                    ) : (
                      <>
                        <span className="icon">🔍</span>
                        বাস খুঁজুন
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
                <div className="stat-value">৫০,০০০+</div>
                <div className="stat-title">দৈনিক টিকেট</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">৪.৮/৫.০</div>
                <div className="stat-title">গ্রাহক রেটিং</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🚌</div>
              <div className="stat-info">
                <div className="stat-value">২৫০+</div>
                <div className="stat-title">সক্রিয় বাস</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">😊</div>
              <div className="stat-info">
                <div className="stat-value">১০ লক্ষ+</div>
                <div className="stat-title">সন্তুষ্ট যাত্রী</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="routes-section-pro" id="routes">
        <div className="container">
          <div className="section-header-pro">
            <h2 className="section-title-pro">আমাদের বাস চলাচলের রুট</h2>
            <p className="section-subtitle-pro">
              খুলনা ট্রাভেলস বাংলাদেশের বিভিন্ন গুরুত্বপূর্ণ রুটে নিয়মিত বাস সেবা প্রদান করে
            </p>
          </div>

          <div className="routes-grid-pro">
            {[
              { from: 'Khulna', to: 'Kuakata', time: '6-7 ঘন্টা', buses: '১৫টি' },
              { from: 'Jessore', to: 'Kuakata', time: '7-8 ঘন্টা', buses: '১২টি' },
              { from: 'Noapara', to: 'Kuakata', time: '6-7 ঘন্টা', buses: '১০টি' },
              { from: 'Khulna', to: 'Patuakhali', time: '5-6 ঘন্টা', buses: '৮টি' },
              { from: 'Jessore', to: 'Barishal', time: '6-7 ঘন্টা', buses: '৭টি' },
              { from: 'Khulna', to: 'Pirojpur', time: '4-5 ঘন্টা', buses: '৯টি' }
            ].map((route, idx) => (
              <div key={idx} className="route-card-pro">
                <div className="route-badge">জনপ্রিয়</div>
                <div className="route-path">
                  <span className="route-from">{route.from}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{route.to}</span>
                </div>
                <div className="route-details">
                  <div className="route-info-item">
                    <span className="info-icon">⏱️</span>
                    <span>{route.time}</span>
                  </div>
                  <div className="route-info-item">
                    <span className="info-icon">🚌</span>
                    <span>{route.buses} বাস</span>
                  </div>
                </div>
                <button className="route-book-btn">এখনই বুক করুন</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="payment-section-pro">
        <div className="container">
          <div className="section-header-pro">
            <h2 className="section-title-pro">পেমেন্ট মেথড</h2>
            <p className="section-subtitle-pro">আমরা সব ধরনের পেমেন্ট গ্রহণ করি</p>
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
            <h2 className="section-title-pro">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h2>
            <p className="section-subtitle-pro">আপনার প্রশ্নের উত্তর এখানে পেতে পারেন</p>
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