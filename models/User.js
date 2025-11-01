const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Needed for password hashing and comparison

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// PRE-SAVE HOOK: Hash the password before saving the user document
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        // If the password field wasn't modified, skip hashing
        return next();
    }

    try {
        // Generate a salt and then hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err); // Pass any error to the next middleware
    }
});

// METHOD: Create the comparePassword method for the login route
// This is the function that was likely missing and causing the 500 error.
UserSchema.methods.comparePassword = async function(candidatePassword) {
    // Compare the candidate password with the stored hashed password (this.password)
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
