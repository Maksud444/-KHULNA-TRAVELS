import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page container">
      <section className="about-hero">
        <div className="hero-content">
          <h1>About Khulna Travels</h1>
          <p className="lead">Reliable intercity bus services connecting Khulna and surrounding regions since 2010.</p>
          <p>We are committed to ensuring safe, comfortable, and affordable travel.</p>
        </div>
      </section>

      <section className="about-content">
        <div className="card">
          <h2>Our Mission</h2>
          <p>
            To provide dependable transportation with exceptional customer service and competitive fares. We prioritize safety, comfort, and punctuality on every trip.
          </p>
        </div>

        <div className="card">
          <h2>Our History</h2>
          <p>
            Starting as a small local operator, Khulna Travels has grown into one of the region's most recognized bus services, serving thousands of passengers every month.
          </p>
        </div>

        <div className="card">
          <h2>Contact & Support</h2>
          <p>
            Hotline: <strong>01834201628</strong><br />
            Email: <strong>info@khulnatravels.com</strong>
          </p>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet The Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="avatar">AS</div>
            <div className="member-info">
              <h3>Ashraf</h3>
              <p>Founder & CEO</p>
            </div>
          </div>

          <div className="team-member">
            <div className="avatar">ST</div>
            <div className="member-info">
              <h3>Sadia</h3>
              <p>Operations Lead</p>
            </div>
          </div>

          <div className="team-member">
            <div className="avatar">RK</div>
            <div className="member-info">
              <h3>Rafiq</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to travel?</h2>
        <p>Search routes and book your tickets in a few clicks.</p>
        <div className="cta-actions">
          
          <a className="btn" href="/contact">Contact Support</a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
