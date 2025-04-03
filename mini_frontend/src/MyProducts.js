import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyProducts.css';
import { FaEdit } from 'react-icons/fa';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/myproducts', {
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setError('Failed to load products');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/myproducts/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setProducts(products.filter(product => product._id !== productId));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setError('Failed to delete product');
            console.error('Error:', error);
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