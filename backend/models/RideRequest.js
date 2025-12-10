const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'arrived', 'ongoing', 'rejected', 'cancelled', 'completed'],
        default: 'requested'
    },
    seatsRequested: {
        type: Number,
        default: 1
    },
    notes: {
        type: String
    },
    otp: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('RideRequest', rideRequestSchema);
