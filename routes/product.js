const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // The new Product model

/**
 * Helper function to initialize mock product data if the collection is empty.
 * This ensures the frontend always has products to display.
 */
async function initializeProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("Product collection is empty. Initializing mock data...");
            const mockProducts = [
                {
                    id: 'SKU001',
                    name: 'Cosmic Mug',
                    description: 'A ceramic mug featuring a stunning nebula print. Perfect for coffee or tea.',
                    price: 19.99,
                    imageUrl: 'https://placehold.co/150x150/2a4365/ffffff?text=Mug'
                },
                {
                    id: 'SKU002',
                    name: 'Ergonomic Keyboard',
                    description: 'Split mechanical keyboard designed for maximum wrist comfort and efficiency.',
                    price: 129.50,
                    imageUrl: 'https://placehold.co/150x150/48bb78/000000?text=Keyboard'
                },
                {
                    id: 'SKU003',
                    name: 'Noise-Cancelling Headphones',
                    description: 'Over-ear headphones with industry-leading active noise cancellation.',
                    price: 299.99,
                    imageUrl: 'https://placehold.co/150x150/f6ad55/000000?text=Audio'
                },
                {
                    id: 'SKU004',
                    name: 'Portable Solar Charger',
                    description: 'High-capacity power bank with integrated solar panels for off-grid charging.',
                    price: 45.00,
                    imageUrl: 'https://placehold.co/150x150/9f7aea/ffffff?text=Solar'
                }
            ];
            await Product.insertMany(mockProducts);
            console.log("Mock products initialized successfully.");
        }
    } catch (error) {
        console.error("Error initializing products:", error.message);
    }
}

// Immediately attempt to initialize products on load
initializeProducts();


/**
 * @route GET /api/products
 * @desc Retrieves all available products.
 * @access Public (No JWT required)
 */
router.get('/', async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find({});
        
        // Respond with the list of products
        res.json(products);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during GET products.');
    }
});


// IMPORTANT: You need to expose this router object
module.exports = router;
