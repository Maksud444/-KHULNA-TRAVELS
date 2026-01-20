import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ value, onChange, minDate, placeholder = 'Select Date' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datePickerRef = useRef(null);

  const monthNamesBengali = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const monthNamesEnglish = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNamesShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(year, month, i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    if (!day.isCurrentMonth) return;

    const dateStr = day.fullDate.toISOString().split('T')[0];
    setSelectedDate(day.fullDate);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onChange(today.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isPastDate = (date) => {
    if (!minDate) return false;
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < min;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = monthNamesEnglish[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="custom-datepicker" ref={datePickerRef}>
      <div 
        className="datepicker-input-wrapper" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          className="datepicker-input"
          value={selectedDate ? formatDisplayDate(selectedDate) : ''}
          placeholder={placeholder}
          readOnly
        />
        <span className="calendar-icon">📅</span>
      </div>

      {isOpen && (
        <div className="datepicker-dropdown">
          {/* Header */}
          <div className="calendar-header">
            <button 
              className="nav-button prev-button" 
              onClick={handlePrevMonth}
              type="button"
            >
              ‹
            </button>
            <div className="month-year-display">
              <span className="month-name">
                {monthNamesEnglish[currentMonth.getMonth()]}
              </span>
              <span className="year-name">
                {currentMonth.getFullYear()}
              </span>
            </div>
            <button 
              className="nav-button next-button" 
              onClick={handleNextMonth}
              type="button"
            >
              ›
            </button>
          </div>

          {/* Day Names */}
          <div className="day-names">
            {dayNamesShort.map((day, idx) => (
              <div 
                key={idx} 
                className={`day-name ${idx === 0 || idx === 6 ? 'weekend-name' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {days.map((day, idx) => (
              <button
                key={idx}
                type="button"
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${
                  isToday(day.fullDate) ? 'today' : ''
                } ${
                  isSelected(day.fullDate) ? 'selected' : ''
                } ${
                  isWeekend(day.fullDate) ? 'weekend' : ''
                } ${
                  isPastDate(day.fullDate) ? 'disabled' : ''
                }`}
                onClick={() => handleDateSelect(day)}
                disabled={!day.isCurrentMonth || isPastDate(day.fullDate)}
              >
                {day.date}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="calendar-footer">
            <button 
              className="today-button" 
              onClick={handleToday}
              type="button"
            >
              আজ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;