// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    sku: {
        type: String,
        unique: true
    }
});

// CRITICAL FIX: The third argument explicitly sets the collection name to 'Products' 
// (matching your database casing). This solves the population error.
module.exports = mongoose.model('Product', ProductSchema, 'Products');