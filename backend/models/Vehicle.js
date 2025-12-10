const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    model: {
        type: String,
        required: true
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
        required: true
    },
    photo: {
        type: String
    },
    condition: {
        type: String // e.g., 'good', 'excellent'
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
