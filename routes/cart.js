// Example using Node.js and Express.js
// This file would typically be imported and used by your main server.js

const express = require('express');
const router = express.Router();
// Assuming you have an authentication middleware defined elsewhere
const authenticateToken = require('../middleware/auth'); 

// --- Simulated Cart Data Store (Replace with MongoDB/Firestore in a real app) ---
// Key: userId, Value: Array of { productId: string, quantity: number }
const userCarts = {}; 

/**
 * @route POST /api/cart
 * @desc Adds a product to the user's shopping cart or increases its quantity.
 * @access Private (Requires JWT)
 */
router.post('/cart', authenticateToken, (req, res) => {
    const userId = req.userId; // Extracted from JWT by middleware
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ msg: 'Product ID is required.' });
    }

    // Initialize cart if it doesn't exist
    if (!userCarts[userId]) {
        userCarts[userId] = [];
    }

    const cart = userCarts[userId];
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    console.log(`User ${userId} added product ${productId}. Current Cart:`, cart);
    
    // Success response - The frontend will proceed with its local state update
    res.json({ 
        msg: 'Product added/updated in cart successfully.',
        cartLength: cart.length
    });
});


/**
 * @route GET /api/cart
 * @desc Retrieves the current state of the user's shopping cart.
 * @access Private (Requires JWT)
 */
router.get('/cart', authenticateToken, (req, res) => {
    const userId = req.userId;
    const cart = userCarts[userId] || [];
    
    // Sends the cart contents back to the frontend
    res.json(cart);
});


/**
 * @route DELETE /api/cart/:productId
 * @desc Removes a specific product from the cart.
 * @access Private (Requires JWT)
 */
router.delete('/cart/:productId', authenticateToken, (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userCarts[userId]) {
        return res.status(404).json({ msg: 'Cart not found for this user.' });
    }

    const initialLength = userCarts[userId].length;
    
    // Filter out the item to be deleted
    userCarts[userId] = userCarts[userId].filter(item => item.productId !== productId);

    if (userCarts[userId].length < initialLength) {
        return res.json({ msg: `Product ${productId} removed from cart.` });
    } else {
        return res.status(404).json({ msg: 'Product not found in cart.' });
    }
});


// IMPORTANT: You need to expose this router object
module.exports = router;
