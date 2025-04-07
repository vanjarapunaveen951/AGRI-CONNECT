import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import './Userlogin.css';

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
            console.log('Attempting login for:', email);

            // Use fetch instead of axios for more control over credentials
            const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                throw new Error(`Login failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response data:', data);

            if (data.success) {
                // Store user info in localStorage for persistent auth
                const userData = {
                    email: data.user.email,
                    username: data.user.username || '',
                    role: data.user.role || '',
                    isLoggedIn: true,
                    loginTime: new Date().toISOString()
                };

                // Store as a JSON string
                localStorage.setItem('userData', JSON.stringify(userData));

                console.log('Login successful, redirecting based on role:', data.user.role);

                // Redirect based on role
                if (data.user.role === 'producer') {
                    navigate('/ProducerHome');
                } else {
                    navigate('/ConsumerHome');
                }
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please try again.');
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