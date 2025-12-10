const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    profilePhoto: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'driver', 'admin'],
        default: 'user'
    },
    rating: {
        type: Number,
        default: 0
    },
    preferences: {
        timing: String,
        maxDetour: Number,
        vehicleType: String,
        ecoFocus: Boolean
    },
    notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
