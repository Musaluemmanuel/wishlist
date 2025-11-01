// models/Wishlist.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    // Links this wishlist document to a specific User
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference the 'User' model
        required: true,
        unique: true // A user can only have one wishlist document in the database
    },
    // An array of IDs pointing to the products the user wants
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Product' // Reference the 'Product' model
    }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);