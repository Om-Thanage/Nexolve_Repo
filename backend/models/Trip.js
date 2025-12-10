const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    startLocation: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
        address: String
    },
    endLocation: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
        address: String
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    routeGeometry: {
        type: String // Polyline string or GeoJSON
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    farePerSeat: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    carbonSavings: {
        type: Number, // in kg CO2
        default: 0
    }
}, { timestamps: true });

tripSchema.index({ startLocation: '2dsphere' });
tripSchema.index({ endLocation: '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);
