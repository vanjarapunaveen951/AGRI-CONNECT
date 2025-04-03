import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import './Userlogin.css';

// Configure axios defaults
axios.defaults.withCredentials = true;

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/login`, 
                { email, password },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Redirect based on role
                if (response.data.user.role === 'producer') {
                    navigate('/ProducerHome');
                } else {
                    navigate('/ConsumerHome');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome to AgriConnect</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="error-message">
                        <FaExclamationCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="input-with-icon"
                                aria-label="Email address"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                className="input-with-icon"
                                aria-label="Password"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button 
                        type="submit" 
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : (
                            <>
                                Login <FaArrowRight className="button-icon" />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? 
                        <span onClick={() => navigate('/register')}> Create one now</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;