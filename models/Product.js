const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // Unique SKU/ID for the product. This ID is used by CartItem and WishlistItem.
    id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: false,
        default: 'https://placehold.co/150x150/0000FF/FFFFFF?text=Product' // Placeholder
    }
});

module.exports = mongoose.model('Product', ProductSchema);
