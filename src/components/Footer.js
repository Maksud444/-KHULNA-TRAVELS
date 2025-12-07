import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Company Info */}
        <div className="footer-section">
          <h3>KHULNA TRAVELS</h3>
          <p>আপনার বিশ্বস্ত যাত্রা সঙ্গী</p>
          <p className="footer-description">
            ২০১০ সাল থেকে খুলনা, কুয়াকাটা এবং আশেপাশের এলাকায় নিরাপদ ও আরামদায়ক বাস সেবা প্রদান করে আসছি।
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>দ্রুত লিংক</h4>
          <ul className="footer-links">
            <li><a href="/">🏠 হোম</a></li>
            <li><a href="/about">ℹ️ আমাদের সম্পর্কে</a></li>
            <li><a href="/contact">📞 যোগাযোগ</a></li>
            <li><a href="/terms">📋 শর্তাবলী</a></li>
          </ul>
        </div>

        {/* Routes */}
        <div className="footer-section">
          <h4>জনপ্রিয় রুট</h4>
          <ul className="footer-links">
            <li>📍 কুয়াকাটা → খুলনা</li>
            <li>📍 জেসোর → কুয়াকাটা</li>
            <li>📍 নোয়াপাড়া → বরিশাল</li>
            <li>📍 খুলনা → বরিশাল</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>যোগাযোগ করুন</h4>
          <ul className="footer-contact">
            <li>📱 ফোন: 01712-345678</li>
            <li>📧 ইমেইল: info@khulnatravels.com</li>
            <li>📍 ঠিকানা: খুলনা, বাংলাদেশ</li>
            <li>🕒 সময়: ২৪/৭ সেবা</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; 2024 KHULNA TRAVELS. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="footer-social">
            <a href="#" className="social-link">📘 Facebook</a>
            <a href="#" className="social-link">📷 Instagram</a>
            <a href="#" className="social-link">🐦 Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;