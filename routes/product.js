// This file is required by server.js but only needs a simple GET route 
// to prevent the "Cannot find module" error.

const express = require('express');
const router = express.Router();

// Simulated static product data (matches the frontend's hardcoded data for consistency)
const PRODUCTS = [
    { id: 'prod-001', name: 'Premium Coffee Grinder', price: 49.99, description: 'Grind your beans perfectly every time.' },
    { id: 'prod-002', name: 'Smart Watch X90', price: 199.99, description: 'Fitness tracking and notifications.' },
    { id: 'prod-003', name: 'Ergonomic Desk Chair', price: 349.00, description: 'Support your back during long sessions.' },
    { id: 'prod-004', name: 'Noise-Cancelling Headphones', price: 129.99, description: 'Immersive sound experience.' },
    { id: 'prod-005', name: 'Mechanical Keyboard', price: 85.50, description: 'Tactile switches for typing enthusiasts.' },
];

/**
 * @route GET /api/product
 * @desc Retrieves the full list of products.
 * @access Public (No JWT required)
 */
router.get('/', (req, res) => {
    // Returns the simulated product list
    res.json(PRODUCTS);
});

module.exports = router;
