import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductForm.css';

const ProductForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        product_name: '',
        mobile_number: '',
        email: '',
        price: '',
        address: '',
        farming: 'organic',
        stock_availability: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            try {
                console.log('Checking auth in ProductForm');
                const userDataString = localStorage.getItem('userData');

                if (!userDataString) {
                    console.log('No user data found in localStorage');
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(userDataString);
                console.log('User data from localStorage:', userData);

                if (!userData.isLoggedIn || !userData.email || userData.role !== 'producer') {
                    console.log('Invalid user data or not a producer');
                    navigate('/login');
                    return;
                }

                // User is authenticated as a producer
                console.log('User authenticated as producer:', userData.email);

                // Set the form data with user information
                setFormData(prev => ({
                    ...prev,
                    email: userData.email,
                    username: userData.username || userData.email.split('@')[0] // Use part before @ as username if no username
                }));

                console.log('Set initial form data with:', {
                    email: userData.email,
                    username: userData.username || userData.email.split('@')[0]
                });
            } catch (error) {
                console.error('Error checking authentication:', error);
                navigate('/login');
            }
        };

        checkAuth();
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
        const requiredFields = ['username', 'product_name', 'mobile_number', 'email', 'address', 'stock_availability'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setErrorMessage(`${field.replace('_', ' ')} is required.`);
                return;
            }
        }

        // Make sure username is set
        if (!formData.username) {
            // If username is not set but we have userData, use that
            const userDataString = localStorage.getItem('userData');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                if (userData.username) {
                    setFormData(prev => ({
                        ...prev,
                        username: userData.username
                    }));
                } else {
                    // If no username in userData, use email as username
                    setFormData(prev => ({
                        ...prev,
                        username: userData.email.split('@')[0] // Use part before @ as username
                    }));
                }
            } else {
                setErrorMessage('Username is required. Please log in again.');
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
            // Make a copy of the form data to ensure username is set
            const productData = { ...formData };

            // If username is still not set, try to get it from localStorage
            if (!productData.username) {
                const userDataString = localStorage.getItem('userData');
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    productData.username = userData.username || userData.email.split('@')[0];
                }
            }

            console.log('Submitting product data:', productData);
            const response = await fetch(process.env.REACT_APP_API_URL + '/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(productData),
                credentials: 'include'
            });

            if (response.status === 401) {
                console.log('Unauthorized response when adding product');
                // Check if we're still authenticated on the client side
                const userDataString = localStorage.getItem('userData');
                if (!userDataString) {
                    navigate('/login');
                    return;
                }
            }

            const data = await response.json();
            console.log('Product submission response:', data);

            if (data.success) {
                setSuccessMessage('Product added successfully!');
                // Reset form data
                setFormData({
                    username: formData.username, // Keep username
                    product_name: '',
                    mobile_number: '',
                    email: formData.email, // Keep email
                    price: '',
                    address: '',
                    farming: 'organic',
                    stock_availability: ''
                });
                alert('Product added successfully!');
            } else {
                setErrorMessage(data.message || 'Error adding product');
                alert('Error adding product: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            setErrorMessage('Error connecting to server: ' + error.message);
            console.error('Error:', error);
            alert('Error connecting to server: ' + error.message);
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