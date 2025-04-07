import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Edit.css';

const Edit = () => {
    const [formData, setFormData] = useState({
        product_name: '',
        farming: '',
        stock_availability: '',
        mobile_number: '',
        address: '',
        email: '',
        price: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            try {
                console.log('Checking auth in Edit');
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
                fetchProduct();
            } catch (error) {
                console.error('Error checking authentication:', error);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    const fetchProduct = async () => {
        try {
            console.log('Fetching product details for ID:', id);
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                console.log('Unauthorized response when fetching product');
                // We'll try to continue anyway since we're using localStorage for auth
            }

            const data = await response.json();
            console.log('Product data:', data);

            if (data.success) {
                setFormData(data.product);
            } else {
                throw new Error(data.message || 'Failed to fetch product details');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const address = data.display_name;
                        setFormData(prev => ({
                            ...prev,
                            address: address
                        }));
                    } catch (error) {
                        console.error('Error getting location:', error);
                        setError('Failed to get location');
                    }
                },
                (error) => {
                    console.error('Error:', error);
                    setError('Failed to get location');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get the user's email from localStorage
            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                navigate('/login');
                return;
            }

            const userData = JSON.parse(userDataString);
            const email = userData.email;

            // Make sure the email in the form data matches the logged-in user
            const updatedFormData = {
                ...formData,
                email: email // Ensure the email is set correctly
            };

            console.log('Submitting updated product data:', updatedFormData);
            // Add email as a query parameter for authentication
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}?email=${encodeURIComponent(email)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedFormData)
            });

            if (response.status === 401 || response.status === 403) {
                console.log(`Error response when updating product: ${response.status}`);
                if (response.status === 403) {
                    alert('You can only update your own products');
                    return;
                }

                // Check if we're still authenticated on the client side
                if (!userDataString) {
                    navigate('/login');
                    return;
                }
            }

            const data = await response.json();
            console.log('Update response:', data);

            if (data.success) {
                alert('Product updated successfully!');
                navigate('/myproducts');
            } else {
                throw new Error(data.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to update product: ' + error.message);
            alert('Failed to update product: ' + error.message);
        }
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="edit-container">
            <div className="form-logo"></div>
            <h2 className="form-title">Edit Product</h2>
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label>Product Name:</label>
                    <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Farming Type:</label>
                    <select name="farming" value={formData.farming} onChange={handleChange} required>
                        <option value="organic">Organic</option>
                        <option value="inorganic">Inorganic</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Stock Availability (KG):</label>
                    <input type="number" name="stock_availability" value={formData.stock_availability} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Mobile Number:</label>
                    <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Address:</label>
                    <div className="location-input">
                        <textarea name="address" value={formData.address} onChange={handleChange} required />
                        <button type="button" className="location-button" onClick={getCurrentLocation}>Get Location</button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Price:</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </div>

                <div className="button-group">
                    <button type="submit" className="submit-button">Update Product</button>
                    <button type="button" className="cancel-button" onClick={() => navigate('/myproducts')}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default Edit;