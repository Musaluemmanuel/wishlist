const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables for JWT_SECRET
dotenv.config();

// Import the User Model
const User = require('../models/User');

// Use the secret from your .env file
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '1h'; // Tokens expire after 1 hour

// @route POST /api/auth/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
    // Destructure username along with email and password
    const { username, email, password } = req.body; 

    // Basic input validation
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields: username, email, and password.' });
    }

    try {
        // 1. Check if user already exists (by email)
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with that email already exists' });
        }
        
        // 2. Check if username is already taken
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'This username is already taken' });
        }

        // 3. Create new user instance, now including username
        user = new User({ username, email, password });
        
        // Save the user before creating the token.
        await user.save(); 

        // 4. Create and return JWT
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username // CRITICAL: Include username in JWT payload
            }
        };

        jwt.sign(
            payload.user,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION },
            (err, token) => {
                if (err) throw err;
                // Return user data in the response for immediate frontend use
                res.status(201).json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        email: user.email, 
                        username: user.username 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        // FIX: Ensure all server errors return a JSON object.
        res.status(500).json({ msg: 'Server error during registration', error: err.message });
    }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token
// @access Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter both email and password.' });
    }
    
    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Check password
        const isMatch = await user.comparePassword(password); 
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Create and return JWT
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username // CRITICAL: Include username in JWT payload
            }
        };

        jwt.sign(
            payload.user,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION },
            (err, token) => {
                if (err) throw err;
                // Return user data in the response for immediate frontend use
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        email: user.email, 
                        username: user.username 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        // FIX: Ensure all server errors return a JSON object.
        res.status(500).json({ msg: 'Server error during login', error: err.message });
    }
});

module.exports = router;
