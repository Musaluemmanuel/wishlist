// Express.js Wishlist API Routes
const express = require('express');
const router = express.Router();
// Assuming the middleware/auth.js file exists and exports authenticateToken
const authenticateToken = require('../middleware/auth'); 

// --- Simulated Wishlist Data Store (Replace with MongoDB/Firestore in a real app) ---
// Key: userId, Value: Array of productIds
const userWishlists = {}; 

/**
 * @route POST /api/wishlist
 * @desc Adds a product to the user's wishlist.
 * @access Private (Requires JWT)
 */
router.post('/', authenticateToken, (req, res) => {
    const userId = req.userId; // Extracted from JWT by middleware
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ msg: 'Product ID is required.' });
    }

    // Initialize wishlist if it doesn't exist
    if (!userWishlists[userId]) {
        userWishlists[userId] = [];
    }

    const wishlist = userWishlists[userId];
    
    // Check if item is already in the wishlist to prevent duplicates
    if (wishlist.includes(productId)) {
        return res.status(200).json({ msg: 'Product is already in the wishlist.', productId });
    }

    // Add product ID to the wishlist
    wishlist.push(productId);

    console.log(`User ${userId} added product ${productId} to wishlist. Current Wishlist:`, wishlist);
    
    // Success response
    res.status(201).json({ 
        msg: 'Product added to wishlist successfully.',
        productId: productId,
        wishlistLength: wishlist.length
    });
});


/**
 * @route GET /api/wishlist
 * @desc Retrieves the user's wishlist contents (list of product IDs).
 * @access Private (Requires JWT)
 */
router.get('/', authenticateToken, (req, res) => {
    const userId = req.userId;
    const wishlist = userWishlists[userId] || [];
    
    // Sends the wishlist product IDs back to the frontend
    res.json(wishlist);
});


/**
 * @route DELETE /api/wishlist/:productId
 * @desc Removes a specific product from the wishlist.
 * @access Private (Requires JWT)
 */
router.delete('/:productId', authenticateToken, (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userWishlists[userId]) {
        return res.status(404).json({ msg: 'Wishlist not found for this user.' });
    }

    const initialLength = userWishlists[userId].length;
    
    // Filter out the item to be deleted
    userWishlists[userId] = userWishlists[userId].filter(id => id !== productId);

    if (userWishlists[userId].length < initialLength) {
        return res.json({ msg: `Product ${productId} removed from wishlist.` });
    } else {
        // This case should ideally not happen if the product ID is valid
        return res.status(404).json({ msg: 'Product not found in wishlist.' });
    }
});


// IMPORTANT: You need to expose this router object
module.exports = router;
