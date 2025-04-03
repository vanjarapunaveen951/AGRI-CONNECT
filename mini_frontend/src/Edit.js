import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Edit.css'; // Make sure this points to the CSS file I provided earlier

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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:3001/products/${id}`, {
                    credentials: 'include'
                });

                if (response.status === 401) {
                    navigate('/login');
                    return;
                }

                const data = await response.json();
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

        fetchProduct();
    }, [id, navigate]);

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
            const response = await fetch(`http://localhost:3001/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                navigate('/myproducts');
            } else {
                throw new Error(data.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to update product');
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