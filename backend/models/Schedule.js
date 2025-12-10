const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['rider', 'driver'],
        required: true
    },
    pattern: {
        days: [{ // e.g., ['Mon', 'Tue']
            type: String,
            enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }]
    },
    origin: {
        address: String,
        coordinates: [Number]
    },
    destination: {
        address: String,
        coordinates: [Number]
    },
    timeWindow: {
        start: String, // "09:00"
        end: String    // "18:00"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
