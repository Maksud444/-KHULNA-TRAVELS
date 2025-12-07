import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  // All FROM locations (39 total)
  const allFromLocations = [
    'Kuakata', 'Alipur', 'Mohipur', 'Hajipur', 'Pakhimara', 'Kolapara',
    'Amtoli', 'Sakaria', 'Potuakhali', 'Pagla', 'Senanibas', 'Bakergonj',
    'Rupatoli', 'Barishal', 'Monihar', 'Jessore', 'Rupadia', 'Basundia',
    'Noapara', 'Fultola', 'Afilgat', 'Garrison', 'Shiromony', 'Fulbari',
    'Daulatpur', 'Notun Rasta', 'Abu Naser', 'Royel Mor', 'Sonadanga',
    'Zero Point', 'Jabusa', 'Kudirbottola', 'Katakhali', 'Bagerhat',
    'Pirojpur', 'Rajapur', 'Jhalokathi', 'Notullabad', 'Khulna'
  ];

  // Route mapping based on 4 groups - exact structure as requested
  const routeMapping = {
    // GROUP 1: Kuakata and related FROM locations → Khulna, Noapara, Jessore
    'Kuakata': ['Khulna', 'Noapara', 'Jessore'],
    'Alipur': ['Khulna', 'Noapara', 'Jessore'],
    'Mohipur': ['Khulna', 'Noapara', 'Jessore'],
    'Hajipur': ['Khulna', 'Noapara', 'Jessore'],
    'Pakhimara': ['Khulna', 'Noapara', 'Jessore'],
    'Kolapara': ['Khulna', 'Noapara', 'Jessore'],
    'Amtoli': ['Khulna', 'Noapara', 'Jessore'],
    'Sakaria': ['Khulna', 'Noapara', 'Jessore'],
    'Pagla': ['Khulna', 'Noapara', 'Jessore'],
    'Senanibas': ['Khulna', 'Noapara', 'Jessore'],
    
    // GROUP 2: Potuakhali and related FROM locations
    'Potuakhali': ['Khulna', 'Noapara', 'Jessore', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Bakergonj': ['Khulna', 'Noapara', 'Jessore', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Rupatoli': ['Khulna', 'Noapara', 'Jessore', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Barishal': ['Khulna', 'Noapara', 'Jessore', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    
    // GROUP 3: Monihar/Khulna area and related FROM locations
    'Monihar': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Jessore': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Rupadia': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Basundia': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Noapara': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Fultola': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Afilgat': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Garrison': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Shiromony': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Fulbari': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Daulatpur': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Notun Rasta': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Abu Naser': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Royel Mor': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Sonadanga': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Zero Point': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Jabusa': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Kudirbottola': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Katakhali': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Bagerhat': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Pirojpur': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Rajapur': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Khulna': ['Jhalokathi', 'Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    
    // GROUP 4: Jhalokathi and related FROM locations
    'Jhalokathi': ['Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata'],
    'Notullabad': ['Barishal', 'Bakergonj', 'Potuakhali', 'Lebukhali', 'Amtoli', 'Kolapara', 'Mohipur', 'Alipur', 'Kuakata']
  };

  // Get TO locations based on selected FROM
  const getToLocations = (from) => {
    if (!from) return [];
    return routeMapping[from] || [];
  };

  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    journeyDate: '',
    countType: 'All'
  });

  // Available TO locations based on FROM selection
  const availableToLocations = getToLocations(searchData.from);

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
    
    // Check if the swap is valid (new FROM has routes to new TO)
    const newToLocations = getToLocations(newFrom);
    if (newFrom && newToLocations.includes(newTo)) {
      setSearchData({
        ...searchData,
        from: newFrom,
        to: newTo
      });
    } else {
      // If invalid, just swap FROM and reset TO
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
      to: '' // Reset TO when FROM changes
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
      // FIXED: Changed from '/buses' to '/bus-list'
      navigate('/bus-list', { 
        state: {
          from: searchData.from,
          to: searchData.to,
          date: searchData.journeyDate
        }
      });
    }, 1500);
  };

  const faqItems = [
    {
      question: 'কোন কোন রুটে খুলনা ট্রাভেলস বাস চলাচল করে?',
      answer: 'খুলনা ট্রাভেলস খুলনা, যশোর, নোয়াপাড়া থেকে কুয়াকাটা, পটুয়াখালী, বরিশাল সহ ৩৯টি গন্তব্যে বাস সেবা প্রদান করে।'
    },
    {
      question: 'টিকিটের মূল্য কত?',
      answer: 'টিকিটের মূল্য রুট এবং বাসের ধরন অনুযায়ী ভিন্ন হয়। সাধারণত ৮৭০ টাকা থেকে ১৮০০ টাকা পর্যন্ত।'
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
      answer: 'আমাদের AC বাসে রয়েছে আরামদায়ক সিট, ওয়াইফাই, চার্জিং পয়েন্ট, টিভি, স্ন্যাকস এবং পানি।'
    }
  ];

  return (
    <div className="homepage-professional">
      {showNotification && (
        <div className="toast-notification slide-in">
          <span className="toast-icon">🎉</span>
          <span>স্বাগতম! আজই বুক করুন বিশেষ ছাড়ে!</span>
        </div>
      )}

      <div className="top-info-bar">
        <div className="container">
          <div className="info-bar-content">
            <div className="info-item">
              <span className="icon">📞</span>
              <span>হটলাইন: ০১৭০০-০০০০০০</span>
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
        <div className="hero-overlay"></div>
        <div className="hero-bg-pattern"></div>
        <div className="container">
          <div className="hero-content-pro">
            <h1 className="hero-title animate-fade-in">
              অনলাইন টিকেটিং সহজ হয়েছে!
            </h1>
            <p className="hero-subtitle animate-fade-in-delay">
              দেশের যেকোনো প্রান্ত থেকে সহজেই বুক করুন আপনার বাস টিকেট
            </p>

            <div className="live-stats">
              <div className="stat-card">
                <div className="stat-number counter">{ticketCount.toLocaleString('bn-BD')}</div>
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
                      <div className="dropdown-menu animate-slide-down">
                        {allFromLocations.filter(loc => 
                          loc.toLowerCase().includes(searchData.from.toLowerCase())
                        ).map((location, idx) => (
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
                      <div className="dropdown-menu animate-slide-down">
                        {availableToLocations.length > 0 ? (
                          availableToLocations.filter(loc => 
                            loc.toLowerCase().includes(searchData.to.toLowerCase())
                          ).map((location, idx) => (
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

            <div className="current-date-display">
              <span className="icon">📅</span>
              আজকের তারিখ: {formatDate(currentDate)}
            </div>
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
                <button className="route-book-btn">
                  এখনই বুক করুন
                </button>
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
                  <div className="faq-answer-pro animate-slide-down">
                    {item.answer}
                  </div>
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