const mongoose = require('mongoose');

// Define the Token schema
const tokenSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// Create the Token model
const TokenModel = mongoose.model('Token', tokenSchema);

module.exports = TokenModel;