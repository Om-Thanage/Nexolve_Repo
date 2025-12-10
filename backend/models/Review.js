const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Can be a rider or the driver (who is also a User via ref)
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    },
    tags: [{
        type: String // e.g., 'punctual', 'safe driver'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
