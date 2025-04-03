import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProducerHome.css';
import farmerImage from './1738995334930.jpg';

function ProducerHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/session', {
          credentials: 'include',
        });
        const data = await response.json();

        if (!data.success || !data.email || !data.username) {
          
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('userToken');
        navigate('/');
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="producer-container">
      <nav className="producer-nav">
        <div className="nav-logo">
          <h2>AgriConnect</h2>
        </div>
        <div className="nav-buttons">
          <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
        </div>
      </nav>

      <section className="producer-hero">
        <div className="hero-content">
          <h1>Welcome to Your Producer Dashboard</h1>
          <p>Manage your products and connect with customers</p>
        </div>
      </section>

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Add New Products</h3>
          <p>List your fresh produce for customers</p>
          <Link to="/productform" className="card-btn">Add Product</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Products to sell</h3>
          <p>Update your producer profile</p>
          <Link to="/myproducts" className="card-btn">View Details</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>Track your product performance</p>
          <Link to="/ProducerComments" className="card-btn">View Analytics</Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-content">
          <h2>🌟 Featured Benefits</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🌾</span>
              <h3>Fresh From Farm</h3>
              <p>Direct farm-to-table produce with guaranteed freshness</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚛</span>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your customers</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💎</span>
              <h3>Premium Quality</h3>
              <p>High-quality agricultural products at competitive prices</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🤝</span>
              <h3>Trust & Safety</h3>
              <p>Verified producers and secure transactions</p>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://img.freepik.com/free-vector/organic-flat-farming-profession-illustration_23-2148899114.jpg" 
            alt="Modern Farming"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}
          />
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌿 AgriConnect</h3>
            <p>Connecting farmers and consumers for a sustainable future</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📧 support@agriconnect.com</p>
            <p>📞 1-800-AGRI-HELP</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AgriConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ProducerHome;
