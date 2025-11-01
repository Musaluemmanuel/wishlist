// server.js - Complete and Corrected Backend Configuration

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Required for frontend to backend communication
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---

// 1. CORS: Allows requests from the frontend origin (like file:// or http://127.0.0.1)
// For development, allow all origins:
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body Parser: Allows Express to read JSON data sent in request bodies
app.use(express.json());

// --- Database Connection ---

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        // Exit process if connection fails
        process.exit(1); 
    });


// --- Routes ---

// Import Route Handlers
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); // Product routes
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');        // <--- NEW: Import Cart routes

// Mount Routes to specific paths
app.use('/api/auth', authRoutes);         // Handles registration and login
app.use('/api/product', productRoutes);   // Handles fetching the product catalog
app.use('/api/wishlist', wishlistRoutes); // Handles user wishlist CRUD
app.use('/api', cartRoutes);              // <--- NEW: Mount Cart routes (using the '/api' prefix)

// Basic root route for verification
app.get('/', (req, res) => {
    res.send('Wishlist API is operational.');
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
