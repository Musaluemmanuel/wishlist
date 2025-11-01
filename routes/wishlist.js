// Express.js Wishlist API Routes
const express = require('express');
const router = express.Router();
// FIX 1: Rename the import to 'auth' for consistency and clarity,
// matching the export style of middleware/auth.js.
const auth = require('../middleware/auth'); 
const WishlistItem = require('../models/WishlistItem'); // Import Mongoose Model
const mongoose = require('mongoose'); // Needed for checking IDs

/**
 * @route POST /api/wishlist
 * @desc Adds a product to the user's wishlist.
 * @access Private (Requires JWT)
 * @payload { id: String (Product SKU), name: String, price: Number }
 */
router.post('/', auth, async (req, res) => {
    // req.user contains the decoded JWT payload: { userId: '...' }
    // NOTE: Your auth payload should be accessed via req.user.id if using the standard
    // payload structure { user: { id: user._id, ... } } as defined in routes/auth.js.
    // I am assuming your current auth.js uses 'id' inside req.user, not 'userId'.
    const userId = req.user.id; 
    const { id, name, price } = req.body; // Product details from frontend

    if (!id || !name || typeof price === 'undefined') {
        return res.status(400).json({ msg: 'Product ID, name, and price are required.' });
    }

    try {
        // 1. Check if the item already exists in the user's wishlist
        const existingItem = await WishlistItem.findOne({ userId, id });

        if (existingItem) {
            // If it exists, return success but inform it's a duplicate
            return res.status(200).json({ 
                msg: 'Product is already in the wishlist.', 
                item: existingItem 
            });
        }

        // 2. Create and save the new wishlist item
        const newItem = new WishlistItem({
            userId,
            id,
            name,
            price
        });

        const item = await newItem.save();
        
        // Success response
        res.status(201).json({ 
            msg: 'Product added to wishlist successfully.',
            item
        });

    } catch (err) {
        console.error(err.message);
        // FIX 2: Ensure error response is JSON formatted
        res.status(500).json({ msg: 'Server Error during POST wishlist.', error: err.message });
    }
});


/**
 * @route GET /api/wishlist
 * @desc Retrieves the user's wishlist contents.
 * @access Private (Requires JWT)
 */
router.get('/', auth, async (req, res) => {
    // req.user contains the decoded JWT payload: { userId: '...' }
    // I am assuming your current auth.js uses 'id' inside req.user, not 'userId'.
    const userId = req.user.id; 

    try {
        // Find all WishlistItems belonging to the authenticated user
        const wishlist = await WishlistItem.find({ userId }).sort({ timestamp: -1 });
        
        // Sends the list of Mongoose documents back
        res.json(wishlist);

    } catch (err) {
        console.error(err.message);
        // FIX 2: Ensure error response is JSON formatted
        res.status(500).json({ msg: 'Server Error during GET wishlist.', error: err.message });
    }
});


/**
 * @route DELETE /api/wishlist/:itemId
 * @desc Removes a specific wishlist item by its MongoDB _id.
 * @access Private (Requires JWT)
 */
router.delete('/:itemId', auth, async (req, res) => {
    // req.user contains the decoded JWT payload: { userId: '...' }
    // I am assuming your current auth.js uses 'id' inside req.user, not 'userId'.
    const userId = req.user.id;
    const itemId = req.params.itemId;

    // Basic validation for MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ msg: 'Invalid item ID format.' });
    }

    try {
        // Find the item by its MongoDB ID AND ensure it belongs to the authenticated user
        const result = await WishlistItem.deleteOne({
            _id: itemId, // The Mongoose Document ID passed in the URL parameter
            userId: userId // Authorization check
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Wishlist item not found or does not belong to user.' });
        }

        return res.json({ msg: `Wishlist item (ID: ${itemId}) removed successfully.`, removedId: itemId });
        
    } catch (err) {
        console.error(err.message);
        // FIX 2: Ensure error response is JSON formatted
        res.status(500).json({ msg: 'Server Error during DELETE wishlist.', error: err.message });
    }
});


// IMPORTANT: You need to expose this router object
module.exports = router;
