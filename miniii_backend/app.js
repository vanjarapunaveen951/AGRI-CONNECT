require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoDBStore = require('connect-mongodb-session')(session);


app.use(express.json());
// Define allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:3001',
    'https://miniprojectim.vercel.app',  // Add your deployed frontend URL here
    // Add any other frontend URLs as needed
];

// Configure CORS to allow requests from both localhost and deployed frontend
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Additional headers for CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// MongoDB connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connection success");
    } catch (err) {
        console.log("Error connecting to the database:", err);
    }
};

connectToDatabase();

// User schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

const Users = mongoose.model('Users', UserSchema);

//Comments schema

const Messages = new mongoose.Schema({
    Consumer_mail:{
        type:String,
        required:true
    },
    Producer_mail:
    {
        type:String,
        required:true
    },
    product_name: {
        type: String,
        required: true
    },
    message:
    {
        type:String,
        required:true
    }
})

const Message = mongoose.model('Message',Messages);



// Product schema
const ProductSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    mobile_number: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    price: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: true
    },
    farming: {
        type: String,
        required: true
    },
    stock_availability: {
        type: String,
        required: true
    }
});

const Product = mongoose.model('Product', ProductSchema);

// Session store setup
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "my_session"
});

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: store,
    proxy: true, // Trust the reverse proxy when setting secure cookies
    cookie: {
        secure: false, // Set to false for local development with http
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use lax for local development
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined // Set domain for production
    }
}));

// Registration route
app.post('/registration', async (req, resp) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new Users({
        username,
        email,
        password: hashedPassword,
        role
    });
    await user.save();
    resp.send("User registered successfully");
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        // Set session data
        req.session.email = user.email;
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.userId = user._id.toString();

        // Save the session explicitly
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: 'Session error' });
            }

            // Send response after session is saved
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    id: user._id.toString()
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Product creation route
app.post('/products', async (req, resp) => {
    try {
        const {
            username,
            product_name,
            mobile_number,
            email,
            price,
            address,
            farming,
            stock_availability
        } = req.body;


        if (!username || !product_name || !mobile_number || !email) {
            return resp.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const productDetails = new Product({
            username,
            product_name,
            mobile_number,
            email,
            price,
            address,
            farming,
            stock_availability
        });

        await productDetails.save();
        resp.status(201).json({
            success: true,
            message: "Product added successfully",
            product: productDetails
        });
    } catch (error) {
        console.error('Error adding product:', error);

        resp.status(500).json({
            success: false,
            message: "Error adding product",
            error: error.message
        });
    }
});


// Display all products
app.get('/products_data', async (_, resp) => {
    const products = await Product.find();
    resp.send(products);
});

// Product search route
app.get('/filter', async (req, resp) => {
    const { product_name } = req.query;
    const filteredProducts = await Product.find({ product_name: new RegExp(product_name, 'i') });
    resp.send(filteredProducts);
});

// Logout route
app.post('/logout', (req, resp) => {
    console.log('Logout request received');
    try {
        // Check if the session exists
        if (req.session) {
            console.log('Session found, destroying session');
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return resp.status(500).json({
                        success: false,
                        message: "Error logging out",
                    });
                }

                // Clear the session cookie with same settings as it was created
                resp.clearCookie('connect.sid', {
                    path: '/',
                    httpOnly: true,
                    secure: false, // Match the session cookie setting
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
                });

                console.log('Session destroyed successfully');
                // Respond with success message
                return resp.status(200).json({
                    success: true,
                    message: "Logged out successfully",
                });
            });
        } else {
            // If there's no session, the user is already logged out
            console.log('No session found, already logged out');
            return resp.status(200).json({
                success: true,
                message: "Already logged out",
            });
        }
    } catch (error) {
        // Catch any errors that might happen during the process
        console.error("Error during logout:", error);
        return resp.status(500).json({
            success: false,
            message: "Server error during logout",
        });
    }
});



// Route to get user data by email
app.get('/session', (req, resp) => {
    console.log('Session request received');
    console.log('Query params:', req.query);

    // Get email from query parameter
    const email = req.query.email;

    if (!email) {
        console.log('No email provided for session request');
        return resp.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    // Look up the user by email
    Users.findOne({ email: email })
        .then(user => {
            if (user) {
                console.log('User found for email:', email);
                resp.json({
                    success: true,
                    email: user.email,
                    username: user.username,
                    role: user.role || 'unknown'
                });
            } else {
                console.log('No user found for email:', email);
                resp.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        })
        .catch(err => {
            console.error('Error finding user:', err);
            resp.status(500).json({
                success: false,
                message: 'Error finding user'
            });
        });
});

// Route to get products for a user by email
app.get('/myproducts', async (req, res) => {
    console.log('MyProducts request received');
    console.log('Query params:', req.query);

    try {
        // Get email from query parameter
        const email = req.query.email;

        if (!email) {
            console.log('No email provided for myproducts request');
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        console.log('Fetching products for user:', email);
        // Find all products for the user
        const products = await Product.find({ email: email });

        console.log(`Found ${products.length} products for user`);
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching products"
        });
    }
});

// Get single product details
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
});


//Sending Messages

app.post('/send-message', async (req, res) => {
    try {
        console.log('Send message request received');
        console.log('Request body:', req.body);

        const { message, Producer_mail, product_name, Consumer_mail } = req.body;

        if (!Consumer_mail || !Producer_mail || !message || !product_name) {
            console.log('Missing required fields for message');
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Create a new message document
        const newMessage = new Message({
            Consumer_mail,
            Producer_mail,
            product_name,
            message
        });

        // Save the message to the database
        await newMessage.save();
        console.log('Message saved successfully');
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

//Seeing Comments
app.get('/get-comments', async (req, res) => {
    console.log('Get comments request received');
    console.log('Query params:', req.query);

    const producerEmail = req.query.email;
    const product_name = req.query.product_name;

    if (!producerEmail) {
        console.log('No producer email provided');
        return res.status(400).json({ success: false, message: 'Producer email is required' });
    }

    try {
        const query = { Producer_mail: producerEmail };
        if (product_name) {
            query.product_name = product_name;
        }

        console.log('Fetching messages with query:', query);
        const messages = await Message.find(query);
        console.log(`Found ${messages.length} messages`);

        if (!messages.length) {
            return res.status(200).json({ success: true, messages: [], message: 'No comments found' });
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
});


//delete routing

app.delete('/myproducts/:id', async (req, res) => {
    const productId = req.params.id;
    console.log('Delete product request received for ID:', productId);
    console.log('Query params:', req.query);

    try {
        // First find the product to verify ownership
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get email from query parameter
        const email = req.query.email;

        // If email is provided, verify ownership
        if (email && product.email !== email) {
            console.log('Unauthorized deletion attempt. Product email:', product.email, 'Request email:', email);
            return res.status(403).json({ success: false, message: 'You can only delete your own products' });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);
        console.log('Product deleted successfully');

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
});

//edit
app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    console.log('Update product request received for ID:', productId);
    console.log('Query params:', req.query);
    console.log('Request body:', req.body);

    try {
        // First find the product to verify ownership
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get email from query parameter or request body
        const email = req.query.email || req.body.email;

        // If email is provided, verify ownership
        if (email && existingProduct.email !== email) {
            console.log('Unauthorized update attempt. Product email:', existingProduct.email, 'Request email:', email);
            return res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        const updates = {
            product_name: req.body.product_name,
            farming: req.body.farming,
            stock_availability: req.body.stock_availability,
            mobile_number: req.body.mobile_number,
            address: req.body.address,
            email: req.body.email || existingProduct.email, // Keep original email if not provided
            price: req.body.price
        };

        const product = await Product.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        console.log('Product updated successfully');
        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
});


// Test route to verify session functionality
app.get('/test-session', (req, res) => {
    // Set a simple session value
    req.session.testValue = 'This is a test value: ' + new Date().toISOString();
    req.session.save(err => {
        if (err) {
            console.error('Error saving test session:', err);
            return res.status(500).json({ success: false, message: 'Session save error' });
        }
        res.json({
            success: true,
            message: 'Session test successful',
            sessionID: req.sessionID,
            testValue: req.session.testValue
        });
    });
});

// Route to check the test session value
app.get('/check-test-session', (req, res) => {
    res.json({
        success: true,
        hasSession: !!req.session,
        sessionID: req.sessionID,
        testValue: req.session.testValue || 'No test value found',
        allSessionData: req.session
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})