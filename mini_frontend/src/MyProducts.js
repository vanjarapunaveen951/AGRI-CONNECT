import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyProducts.css';
import { FaEdit } from 'react-icons/fa';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            try {
                console.log('Checking auth in MyProducts');
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
                fetchProducts(userData.email);
            } catch (error) {
                console.error('Error checking authentication:', error);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    const fetchProducts = async (email) => {
        if (!email) {
            setError('No email available to fetch products');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching products for:', email);
            // Add email as a query parameter
            const response = await fetch(`${process.env.REACT_APP_API_URL}/myproducts?email=${encodeURIComponent(email)}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 400) {
                console.log(`Error response when fetching products: ${response.status}`);
                // We'll try to continue anyway since we're using localStorage for auth
            }

            const data = await response.json();
            console.log('Products data:', data);

            if (data.success) {
                setProducts(data.products);
            } else {
                console.log('Failed to fetch products:', data.message);
                setProducts([]); // Set empty array to avoid undefined errors
                setError(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            setError('Failed to load products');
            console.error('Error:', error);
            setProducts([]); // Set empty array to avoid undefined errors
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            // Get the user's email from localStorage
            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                navigate('/login');
                return;
            }

            const userData = JSON.parse(userDataString);
            const email = userData.email;

            console.log('Deleting product:', productId, 'for user:', email);
            // Add email as a query parameter
            const response = await fetch(`${process.env.REACT_APP_API_URL}/myproducts/${productId}?email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                console.log(`Error response when deleting product: ${response.status}`);
                if (response.status === 403) {
                    alert('You can only delete your own products');
                    return;
                }

                // Check if we're still authenticated on the client side
                if (!userDataString) {
                    navigate('/login');
                    return;
                }
            }

            const data = await response.json();
            console.log('Delete response:', data);

            if (data.success) {
                // Update the UI immediately
                setProducts(products.filter(product => product._id !== productId));
                alert('Product deleted successfully');
            } else {
                throw new Error(data.message || 'Failed to delete product');
            }
        } catch (error) {
            setError('Failed to delete product');
            console.error('Error:', error);
            alert('Failed to delete product: ' + error.message);
        }
    };

    const handleEdit = async (productId) => {
        try {
            // First verify the product exists and user has permission
            const response = await fetch(`http://localhost:3001/products/${productId}`, {
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                // If successful, navigate to edit page
                navigate(`/edit/${productId}`);
            } else {
                setError('Failed to access product for editing');
            }
        } catch (error) {
            setError('Failed to access product for editing');
            console.error('Error:', error);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="my-products-container">
            <h1>My Products</h1>

            {error && <div className="error-message">{error}</div>}

            {products.length === 0 ? (
                <div className="no-products">
                    <p>You haven't added any products yet.</p>
                    <button onClick={() => navigate('/productform')}>
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="products-list">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            <div className="product-header">
                                <h2>{product.product_name}</h2>
                                <div className="product-rating">
                                    Price: ₹{product.price}
                                </div>
                            </div>

                            <div className="product-details">
                                <div className="detail-group">
                                    <label>Farming Type:</label>
                                    <span>{product.farming}</span>
                                </div>

                                <div className="detail-group">
                                    <label>Stock Available:</label>
                                    <span>{product.stock_availability} KG</span>
                                </div>

                                <div className="detail-group">
                                    <label>Contact:</label>
                                    <span>{product.mobile_number}</span>
                                </div>

                                <div className="detail-group">
                                    <label>Address:</label>
                                    <span>{product.address}</span>
                                </div>
                            </div>

                            <div className="product-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => handleEdit(product._id)}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(product._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProducts;