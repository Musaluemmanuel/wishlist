// middleware/auth.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables for JWT_SECRET
dotenv.config();

// Get the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// This function is the ONLY thing exported by a middleware file.
module.exports = (req, res, next) => {
    // 1. Get token from the header (Authorization: 'Bearer <token>')
    const authHeader = req.header('Authorization');
    
    // Check if the Authorization header is missing
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization denied: No token provided.' });
    }

    // Extract the token part (removes 'Bearer ')
    // Ensure the header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied: Invalid token format. Must be "Bearer [token]".' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verify token
        // If verification fails (wrong secret, expired), it jumps to the catch block
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach user data (which contains { userId: '...' }) to the request
        // The decoded payload is stored as req.user
        req.user = decoded; 
        
        // 4. Continue to the next handler (the route function in wishlist.js)
        next();
    } catch (e) {
        console.error('JWT Verification Error:', e.message);
        // CRITICAL: If the token is invalid, stop execution
        return res.status(401).json({ message: 'Token is not valid (Secret mismatch or expired).' });
    }
};
