// Express.js Cart API Routes
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth'); 
const CartItem = require('../models/CartItem'); // Import the new Mongoose Model
const mongoose = require('mongoose'); // Needed for checking IDs

/**
 * @route POST /api/cart
 * @desc Adds a product to the user's shopping cart or updates its quantity.
 * @access Private (Requires JWT)
 * @payload { id: String (Product SKU), name: String, price: Number, quantity: Number }
 */
router.post('/', authenticateToken, async (req, res) => { 
    // IMPORTANT: Accessing userId via req.user.userId as defined in middleware/auth.js
    // Note: The auth middleware ensures req.user is set.
    const userId = req.user.userId; 
    const { id, name, price, quantity = 1 } = req.body; // Default quantity to 1 if not provided

    if (!id || !name || typeof price === 'undefined' || typeof quantity === 'undefined' || quantity < 1) {
        return res.status(400).json({ msg: 'Product ID, name, price, and valid quantity (>=1) are required.' });
    }

    try {
        // Use findOneAndUpdate to handle both create and update (Upsert logic)
        const updatedItem = await CartItem.findOneAndUpdate(
            // 1. Filter: Find item belonging to this user and with this product ID
            { userId, id },
            // 2. Update/Insert: If found, update quantity. If not found, create new item with all fields.
            {
                userId,
                id,
                name,
                price,
                $inc: { quantity: quantity } // Increment quantity by the provided amount
            },
            // 3. Options: 
            //    - new: return the modified document rather than the original.
            //    - upsert: create the document if it doesn't exist.
            { new: true, upsert: true }
        );

        // Success response
        res.status(200).json({ 
            msg: 'Cart item added or quantity updated successfully.',
            item: updatedItem
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during POST cart item.');
    }
});


/**
 * @route GET /api/cart
 * @desc Retrieves the user's shopping cart contents.
 * @access Private (Requires JWT)
 */
router.get('/', authenticateToken, async (req, res) => {
    // IMPORTANT: Accessing userId via req.user.userId
    const userId = req.user.userId; 

    try {
        // Find all CartItems belonging to the authenticated user
        const cart = await CartItem.find({ userId }).sort({ timestamp: 1 });
        
        // Sends the list of Mongoose documents back
        res.json(cart);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during GET cart.');
    }
});


/**
 * @route DELETE /api/cart/:itemId
 * @desc Removes a specific cart item by its MongoDB _id.
 * @access Private (Requires JWT)
 */
router.delete('/:itemId', authenticateToken, async (req, res) => {
    // IMPORTANT: Accessing userId via req.user.userId
    const userId = req.user.userId;
    const itemId = req.params.itemId;

    // Basic validation for MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ msg: 'Invalid item ID format.' });
    }

    try {
        // Find the item by its MongoDB ID AND ensure it belongs to the authenticated user
        const result = await CartItem.deleteOne({
            _id: itemId, // The Mongoose Document ID passed in the URL parameter
            userId: userId // Authorization check
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Cart item not found or does not belong to user.' });
        }

        return res.json({ msg: `Cart item (ID: ${itemId}) removed successfully.` });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during DELETE cart.');
    }
});


// IMPORTANT: You need to expose this router object
module.exports = router;
