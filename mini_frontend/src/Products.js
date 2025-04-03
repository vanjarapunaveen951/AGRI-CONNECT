import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';
import { useNavigate } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const images = {
        paddy: "https://png.pngtree.com/element_our/20200703/ourlarge/pngtree-cartoon-hand-painted-agriculture-rice-paddy-rice-rice-grain-element-image_2301303.jpg",
        wheat: "https://png.pngtree.com/png-clipart/20190920/original/pngtree-cartoon-yellow-wheat-illustration-png-image_4656941.jpg",
        tomatoes: "https://static.vecteezy.com/system/resources/thumbnails/007/621/433/small_2x/tomato-cartoon-character-vector.jpg",
        potatoes: "https://static.vecteezy.com/system/resources/previews/005/656/675/original/cartoon-illustration-of-potato-isolated-on-white-background-ripe-fresh-vegetable-for-cooking-source-of-vitamins-vector.jpg",
        cauliflower: "https://static.vecteezy.com/system/resources/previews/013/588/781/original/cartoon-cauliflower-illustration-vector.jpg",
        cabbage: "https://static.vecteezy.com/system/resources/previews/021/964/626/original/cabbage-vegetable-cartoon-colored-clipart-free-vector.jpg",
        brinjal: "https://www.pngmart.com/files/15/Purple-Vector-Eggplant-Transparent-PNG.png",
        greengram: "https://image.pngaaa.com/115/1566115-middle.png",
        blackgram: "https://t4.ftcdn.net/jpg/04/07/36/03/360_F_407360310_N4dHJV4tdC5l2W04iNl8Q9d2oDnYon81.jpg",
        onion: "https://static.vecteezy.com/system/resources/previews/007/343/259/original/whole-half-and-sliced-red-onions-isolated-on-white-background-cartoon-illustration-vector.jpg",
        apples: "http://clipart-library.com/images/kcKojzBGi.jpg",
        bananas: "https://static.vecteezy.com/system/resources/previews/001/541/072/original/bunch-of-bananas-cartoon-style-isolated-on-white-background-free-vector.jpg",
        pomegranate: "http://clipartmag.com/images/pomegranate-clipart-30.png",
        carrot: "https://webstockreview.net/images/carrot-clipart-vegetable-8.jpg"
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/products_data');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                await fetchProducts();
                return;
            }
            const response = await axios.get(`http://localhost:3001/filter?product_name=${searchTerm}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const handleViewDetails = (product) => {
        // Open in a new window/tab
        const detailsWindow = window.open('', '_blank');
        detailsWindow.document.write(`
            <html>
                <head>
                    <title>${product.product_name} Details</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                            line-height: 1.6;
                        }
                        h1 {
                            color: #1565C0;
                            border-bottom: 2px solid #1565C0;
                            padding-bottom: 10px;
                        }
                        .details-section {
                            background: #f5f5f5;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <h1>${product.product_name}</h1>
                    <div class="details-section">
                        <h2>Farmer Details</h2>
                        <p><strong>Name:</strong> ${product.username}</p>
                        <p><strong>Contact Number:</strong> ${product.mobile_number}</p>
                    </div>
                </body>
            </html>
        `);
    };

    return (
        <div className="products-container">
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                />
                <button onClick={handleSearch} className="search-button">
                    Search
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="products-grid">
                    {products.map((product, index) => {
                       
                        const productImage = images[product.product_name.toLowerCase()] || "https://source.unsplash.com/800x600/?agriculture";
                        
                        return (
                            <div key={index} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={productImage}
                                        alt={product.product_name}
                                    />
                                </div>
                                <div className="product-info">
                                    <h3>{product.product_name}</h3>
                                    <p>Farmer👨‍🌾 : {product.username}</p>
                                    <p>Price: ₹{product.price}</p>
                                    <div className="product-actions">
                                        <button 
                                            className="view-details-button"
                                            onClick={() => navigate(`/product/${product._id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Products;
