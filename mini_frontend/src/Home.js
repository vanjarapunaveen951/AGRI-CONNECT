import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import farmerImage from './1738995334930.jpg';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>AgriConnect</h1>
          <p className="hero-subtitle">Direct from Farm to You</p>
          <div className="auth-buttons">
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      </section>

      {/* About Section */}

      <section className="about-section">
        <h2>Why Choose AgriConnect?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-handshake"></i>
            <h3>Direct Connection</h3>
            <p>Connect directly with farmers, eliminating middlemen and reducing costs</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-leaf"></i>
            <h3>Fresh Produce</h3>
            <p>Get fresh, high-quality produce straight from local farms</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-dollar-sign"></i>
            <h3>Fair Prices</h3>
            <p>Better prices for both farmers and consumers</p>
          </div>
        </div>
      </section>

      <section className="description-section">
    <div className="description-container">
      <div className="description-content">
        <h2>Revolutionizing Agricultural Marketing</h2>
        <ul className="benefits-list">
          <li>
            <span className="benefit-icon">🌾</span>
            <div className="benefit-text">
              <h4>Direct Farm Access</h4>
              <p>Connect with local farmers and get fresh produce directly from the source</p>
            </div>
          </li>
          <li>
            <span className="benefit-icon">💲</span>
            <div className="benefit-text">
              <h4>Better Pricing</h4>
              <p>Farmers earn more while consumers pay less by eliminating intermediaries</p>
            </div>
          </li>
          <li>
            <span className="benefit-icon">🌱</span>
            <div className="benefit-text">
              <h4>Support Local Agriculture</h4>
              <p>Empower local farmers and contribute to sustainable farming practices</p>
            </div>
          </li>
          <li>
            <span className="benefit-icon">🍎</span>
            <div className="benefit-text">
              <h4>Quality Assurance</h4>
              <p>Get fresh, high-quality produce with complete transparency</p>
            </div>
          </li>
          <li>
            <span className="benefit-icon">📱</span>
            <div className="benefit-text">
              <h4>Easy to Use Platform</h4>
              <p>Simple and intuitive interface for both farmers and consumers</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="description-image">
        <img src={farmerImage} alt="Farmer in field" />
      </div>
    </div>
  </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@agriconnect.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://facebook.com/agriconnect" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="https://twitter.com/agriconnect" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://instagram.com/agriconnect" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AgriConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 