const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    phone: {
        type: String,
        unique: true,
    },
    profilePhoto: String,
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    preferences: {
        timing: String,
        maxDetour: Number,
        vehicleType: [String],
        ecoFocus: {
            type: Boolean,
            default: false
        }
    },
    paymentMethods: [{
        provider: String,
        last4: String,
        details: mongoose.Schema.Types.Mixed
    }],
    commuteHistory: [{
        tripRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip'
        },
        date: Date
    }],
    notificationSettings: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: true
        }
    },
    recurringSchedules: [{
        dayOfWeek: String,
        time: String,
        route: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
