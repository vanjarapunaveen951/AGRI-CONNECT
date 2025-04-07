import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Consumerhome.css';

function ConsumerHome() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in using localStorage
    const checkAuth = () => {
      try {
        console.log('Checking auth in ConsumerHome');
        const userDataString = localStorage.getItem('userData');

        if (!userDataString) {
          console.log('No user data found in localStorage');
          navigate('/login');
          return;
        }

        const userData = JSON.parse(userDataString);
        console.log('User data from localStorage:', userData);

        if (!userData.isLoggedIn || !userData.email || userData.role !== 'consumer') {
          console.log('Invalid user data or not a consumer');
          navigate('/login');
          return;
        }

        // User is authenticated as a consumer
        console.log('User authenticated as consumer:', userData.email);

        // Optional: Verify with backend that user exists
        fetch(`${process.env.REACT_APP_API_URL}/session?email=${encodeURIComponent(userData.email)}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(response => {
          console.log('Backend user check response:', response.status);
          if (response.ok) {
            return response.json();
          }
          throw new Error(`User check failed with status: ${response.status}`);
        }).then(data => {
          console.log('User data from backend:', data);
        }).catch(error => {
          console.log('Backend user check error (non-critical):', error);
        });

      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="consumer-container">
      <nav className="consumer-top-nav">
        <div className="nav-buttons">
          <Link to="/products" className="weird-btn">Browse Products</Link>
          <button onClick={async () => {
            try {
              console.log('Logging out from ConsumerHome...');

              // Clear localStorage first to immediately invalidate the session on the client side
              localStorage.removeItem('userData');
              sessionStorage.clear();

              // Then attempt to logout on the server side
              fetch(`${process.env.REACT_APP_API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              }).then(response => {
                console.log('Logout response status:', response.status);
                return response.json();
              }).then(data => {
                console.log('Logout response data:', data);
              }).catch(error => {
                console.error('Error during server logout (non-critical):', error);
              });

              // Always navigate to home page regardless of server response
              navigate('/');
            } catch (error) {
              console.error('Error during logout:', error);
              // Even if there's an error, navigate to home
              navigate('/');
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
