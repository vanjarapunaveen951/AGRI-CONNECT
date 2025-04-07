import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [fromEmail, setFromEmail] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    // Check authentication
    useEffect(() => {
        // Check if user is logged in using localStorage
        const checkAuth = () => {
            try {
                console.log('Checking auth in ProductDetails');
                const userDataString = localStorage.getItem('userData');

                if (!userDataString) {
                    console.log('No user data found in localStorage');
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(userDataString);
                console.log('User data from localStorage:', userData);

                if (!userData.isLoggedIn || !userData.email) {
                    console.log('Invalid user data');
                    navigate('/login');
                    return;
                }

                // User is authenticated
                console.log('User authenticated:', userData.email);
                setFromEmail(userData.email);
            } catch (error) {
                console.error('Error checking authentication:', error);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`, {
                    credentials: 'include'
                });

                if (response.status === 401) {
                    console.log('Unauthorized response when fetching product');
                    // We'll continue anyway since we're using localStorage for auth
                }

                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
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

        fetchProductDetails();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim() || !fromEmail) {
            alert('Please enter a comment and ensure you are logged in');
            return;
        }

        try {
            console.log('Submitting comment from:', fromEmail, 'to:', product.email);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Consumer_mail: fromEmail,
                    Producer_mail: product.email,
                    product_name: product.product_name, // Add product_name which is required by the backend
                    message: comment.trim()
                }),
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setComment('');
                setShowCommentForm(false);
                alert('Comment submitted successfully!');
            } else {
                throw new Error(data.message || 'Failed to submit comment');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit comment');
        }
    };

    const getWhatsAppLink = (phoneNumber) => {
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        return `https://wa.me/${cleanNumber}`;
    };

    const handleViewLocation = () => {
        const address = encodeURIComponent(product.address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!product) return <div className="error-message">Product not found</div>;

    return (
        <div className="product-details-container">
            <div className="product-details-card">
                <div className="product-header">
                    <h2>{product.product_name}</h2>
                    <div className="product-rating">
                        Price: ₹{product.price}
                    </div>
                </div>

                <div className="product-info-grid">
                    <div className="detail-group">
                        <label>Producer Name:</label>
                        <span>{product.username}</span>
                    </div>

                    <div className="detail-group">
                        <label>Email:</label>
                        <span>{product.email}</span>
                    </div>

                    <div className="detail-group">
                        <label>Farming Type:</label>
                        <span>{product.farming}</span>
                    </div>

                    <div className="detail-group">
                        <label>Stock Available:</label>
                        <span>{product.stock_availability} KG</span>
                    </div>

                    <div className="detail-group">
                        <label>Mobile Number:</label>
                        <span>{product.mobile_number}</span>
                    </div>

                    <div className="detail-group full-width">
                        <label>Address:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>{product.address}</span>
                            <button
                                onClick={handleViewLocation}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                View on Map
                            </button>
                        </div>
                    </div>
                </div>

                <div className="contact-section">
                    <h3>Contact Producer</h3>
                    <div className="contact-options">
                        <a
                            href={getWhatsAppLink(product.mobile_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-button"
                        >
                            Contact via WhatsApp
                        </a>

                        <button
                            className="comment-button"
                            onClick={() => setShowCommentForm(!showCommentForm)}
                        >
                            Leave a Comment
                        </button>
                    </div>
                </div>

                {showCommentForm && (
                    <div className="comment-form-container">
                        <h3>Leave a Comment</h3>
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <div className="email-fields">
                                <label>From (Your Email):</label>

                                <input
                                    type="email"
                                    value={fromEmail}
                                    onChange={(e) => setFromEmail(e.target.value)}
                                    placeholder="Your email"
                                    required
                                />
                            </div>
                            <div className="email-fields">
                                <label>To (Producer Email):</label>
                                <input
                                    type="email"
                                    value={product.email}
                                    readOnly
                                />
                            </div>
                            <div className="email-fields">
                                <label>Product Name:</label>
                                <input
                                    type="text"
                                    value={product.product_name}
                                    readOnly
                                />
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your comment here..."
                                required
                            />
                            <button
                                type="submit"
                                className="send-button"
                            >
                                Submit Comment
                            </button>
                        </form>
                    </div>
                )}

                <div className="product-actions">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
