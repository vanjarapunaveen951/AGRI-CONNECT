import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './utils/axios.config';
import { FaUser, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa';
import './Registration.css';

const Registration = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'consumer'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/registration', formData);

            if (response.data) {
                setSuccessMessage('Registration successful! Redirecting...');
                setErrorMessage('');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-content">
                <div className="register-form-container">
                    <div className="register-header">
                        <h2>Create Account</h2>
                        <p>Join our community of farmers and consumers</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="register-form-group">
                            <div className="input-icon-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-form-group">
                            <div className="input-icon-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-form-group">
                            <div className="input-icon-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-form-group">
                            <div className="input-icon-wrapper">
                                <FaUserTag className="input-icon" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="register-select"
                                >
                                    <option value="consumer">Consumer</option>
                                    <option value="producer">Producer</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`register-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        {errorMessage && <p className="register-error-message">{errorMessage}</p>}
                        {successMessage && <p className="register-success-message">{successMessage}</p>}
                    </form>

                    <div className="register-footer">
                        <p>Already have an account?
                            <span onClick={() => navigate('/login')}> Login here</span>
                        </p>
                    </div>
                </div>

                <div className="register-image-container">
                    <div className="image-overlay">
                        <h3>Welcome to AgriConnect</h3>
                        <p>Connect directly with local farmers and get fresh produce</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
