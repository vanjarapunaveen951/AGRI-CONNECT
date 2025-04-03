import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Consumerhome.css';


function ConsumerHome() {
  const navigate = useNavigate();



  return (
    <div className="consumer-container">
      <nav className="consumer-top-nav">
        <div className="nav-buttons">
          <Link to="/products" className="weird-btn">Browse Products</Link>
          <button onClick={async () => {
            try {
              const response = await fetch('http://localhost:3001/logout', {
                method: 'POST',
                credentials: 'include'
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
          }} className="weird-btn">Logout</button>
        </div>
      </nav>

      <section className="consumer-welcome">
        <div className="welcome-text">
          <h1>Welcome Consumer!</h1>
          <p>Find fresh produce from local farmers</p>
        </div>
      </section>

      <section className="produce-grid">
        <div className="produce-card">
          <div className="card-icon">🥕</div>
          <h3>Fresh Vegetables</h3>
          <p>Locally grown, naturally fresh</p>
        </div>
        
        <div className="produce-card">
          <div className="card-icon">🍎</div>
          <h3>Seasonal Fruits</h3>
          <p>Picked at peak ripeness</p>
        </div>

        <div className="produce-card">
          <div className="card-icon">🌾</div>
          <h3>Organic Grains</h3>
          <p>Pure and unprocessed</p>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Items</h2>
        <div className="featured-items">
          <div className="featured-item">
            <span className="item-emoji">🥬</span>
            <p>Fresh Lettuce</p>
          </div>
          <div className="featured-item">
            <span className="item-emoji">🍅</span>
            <p>Ripe Tomatoes</p>
          </div>
          <div className="featured-item">
            <span className="item-emoji">🥔</span>
            <p>Local Potatoes</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ConsumerHome;
