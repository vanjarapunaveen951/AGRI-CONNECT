import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductForm.css';
import farmerImage from './1738995334930.jpg';

const ProductForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        product_name: '',
        mobile_number: '',
        email: '',
        price: '', // Changed from product_rating to price
        address: '',
        farming: 'organic',
        stock_availability: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const response = await fetch('http://localhost:3001/session', {
                    credentials: 'include',
                    method: 'GET'
                });
                const data = await response.json();

                if (data.success && data.email && data.username) {
                    setFormData(prev => ({
                        ...prev,
                        email: data.email,
                        username: data.username
                    }));
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                navigate('/login');
            }
        };

        fetchSessionData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // General Input Handling
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const locationLink = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
                setFormData(prevData => ({
                    ...prevData,
                    address: locationLink
                }));
            }, (error) => {
                setErrorMessage('Error getting location: ' + error.message);
            });
        } else {
            setErrorMessage('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Check if any required field is empty
        const requiredFields = ['product_name', 'mobile_number', 'address', 'stock_availability'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setErrorMessage(`${field.replace('_', ' ')} is required.`);
                return;
            }
        }

        // Validate mobile number
        if (formData.mobile_number.length !== 10) {
            setErrorMessage('Mobile number must be exactly 10 digits long.');
            return;
        }

        // Validate stock availability
        if (parseFloat(formData.stock_availability) <= 0) {
            setErrorMessage('Stock availability must be a positive number.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Product added successfully!');
                // Reset form data
                setFormData({
                    username: formData.username, // Keep username
                    product_name: '',
                    mobile_number: '',
                    email: formData.email, // Keep email
                    price: '', // Reset price (changed from product_rating)
                    address: '',
                    farming: 'organic',
                    stock_availability: ''
                });
            } else {
                setErrorMessage(data.message || 'Error adding product');
            }
        } catch (error) {
            setErrorMessage('Error connecting to server');
            console.error('Error:', error);
        }
    };

    return (
        <div className="productform-container">
            <div className="productform-wrapper">
                <div className="form-container">
                    <h2>Add New Product</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter product name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                required
                                placeholder="Enter 10-digit mobile number"
                                pattern="[0-9]{10}"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="readonly-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter product price"
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Location will appear here"
                                    readOnly
                                />
                                <button 
                                    type="button" 
                                    onClick={getCurrentLocation}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Get Location
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Farming Type</label>
                            <select
                                name="farming"
                                value={formData.farming}
                                onChange={handleChange}
                                required
                            >
                                <option value="organic">Organic</option>
                                <option value="inorganic">Inorganic</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Stock Availability (in KGs)</label>
                            <input
                                type="number"
                                name="stock_availability"
                                value={formData.stock_availability}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.1"
                                placeholder="Enter available stock in KGs"
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Add Product
                        </button>

                        {errorMessage && (
                            <p className="error-message">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="success-message">{successMessage}</p>
                        )}
                    </form>
                </div>
                <div className="image-container">
                    <div className="animation-container" 
                        style={{
                            width: '300px',
                            height: '300px',
                            position: 'relative',
                            animation: 'float 3s ease-in-out infinite',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="farmer-icon"
                            style={{
                                fontSize: '100px',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}
                        >
                            👨‍🌾
                        </div>
                        <div className="plant-icon"
                            style={{
                                fontSize: '60px',
                                textAlign: 'center',
                                animation: 'grow 2s ease-in-out infinite'
                            }}
                        >
                            🌱
                        </div>
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="bubble"
                                style={{
                                    position: 'absolute',
                                    fontSize: '24px',
                                    animation: `
                                        moveBubble${i} ${8 + i}s linear infinite,
                                        rotateBubble ${4 + i}s linear infinite
                                    `,
                                    opacity: 0.7
                                }}
                            >
                                💧
                            </div>
                        ))}
                        <style>
                            {`
                                @keyframes float {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-20px); }
                                }
                                @keyframes grow {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.2); }
                                }
                                @keyframes rotateBubble {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                ${[...Array(12)].map((_, i) => `
                                    @keyframes moveBubble${i} {
                                        0% {
                                            left: ${Math.random() * 100}%;
                                            top: 100%;
                                        }
                                        100% {
                                            left: ${Math.random() * 100}%;
                                            top: -20%;
                                        }
                                    }
                                `).join('')}
                            `}
                        </style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;