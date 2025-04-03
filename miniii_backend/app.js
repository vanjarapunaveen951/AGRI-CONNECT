require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoDBStore = require('connect-mongodb-session')(session);


app.use(express.json());
// app.use(cors({
//     origin: 'https://agroconnect-webm.onrender.com',
//     credentials: true
// }));

const allowdOrigins=['http://localhost:3000', 'https://agroconnect-webm.onrender.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowdOrigins.includes(origin)) {
            callback(null, true); // Allow request
        } else {
            callback(new Error('Not allowed by CORS')); // Block request
        }
    },
    credentials: true
}));

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3004','https://agroconnect-webm.onrender.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// MongoDB connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect("mongodb+srv://kunaprakash86:VgQbHsw9T7BOIK44@agriconnect.nn8kp.mongodb.net/?retryWrites=true&w=majority&appName=agriconnect");
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
    uri:"mongodb+srv://kunaprakash86:VgQbHsw9T7BOIK44@agriconnect.nn8kp.mongodb.net/?retryWrites=true&w=majority&appName=agriconnect",
    collection: "my_session"
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store:store,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
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

        req.session.email = user.email;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
            success: true,
            message: 'Login successful',
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
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
app.get('/products_data', async (req, resp) => {
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
    try {
        // Check if the session exists
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return resp.status(500).json({
                        success: false,
                        message: "Error logging out",
                    });
                }

                // Clear the session cookie to ensure the client-side cookie is deleted
                resp.clearCookie('connect.sid'); // Ensure this matches the cookie name you're using

                // Respond with success message
                return resp.status(200).json({
                    success: true,
                    message: "Logged out successfully",
                });
            });
        } else {
            // If there's no session, the user is already logged out
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

    

// Add this route to get session data
app.get('/session', (req, resp) => {
    console.log('Session:', req.session);
    if (req.session.email && req.session.username) {
        resp.json({
            success: true,
            email: req.session.email,
            username: req.session.username
        });
    } else {
        resp.status(401).json({
            success: false,
            message: 'No session found'
        });
    }
});

// Add this route to your backend
app.get('/myproducts', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.email) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // Find all products for the logged-in user
        const products = await Product.find({ email: req.session.email });
        
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
        const { message, Producer_mail, product_name } = req.body; 
        const Consumer_mail = req.session.email; 
        if (!Consumer_mail || !Producer_mail || !message || !product_name) {
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
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

//Seeing Comments 
app.get('/get-comments', async (req, res) => {
    const producerEmail = req.session.email;  
    const product_name = req.query.product_name;

    if (!producerEmail) {
        return res.status(401).send('Unauthorized');  
    }

    try {
        const query = { Producer_mail: producerEmail };
        if (product_name) {
            query.product_name = product_name;
        }
        const messages = await Message.find(query);  

        if (!messages.length) {
            return res.status(404).send('No comments found');
        }

        res.json({ success: true, messages });  
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Error fetching messages');
    }
});


//delete routing

app.delete('/myproducts/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
});

//edit
app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const updates = {
        product_name: req.body.product_name,
        farming: req.body.farming,
        stock_availability: req.body.stock_availability,
        mobile_number: req.body.mobile_number,
        address: req.body.address,
        email: req.body.email,
        price: req.body.price
    };

    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

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


//porting

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})