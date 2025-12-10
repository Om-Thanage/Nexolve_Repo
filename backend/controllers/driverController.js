const Driver = require('../models/Driver');
const User = require('../models/user');

const driverController = {
    registerDriver: async (req, res) => {
        try {
            // Assumes user is already authenticated and has a User account
            const { userId, licenseDetails, vehicleId } = req.body;

            // Check if already a driver
            let driver = await Driver.findOne({ user: userId });
            if (driver) {
                return res.status(400).json({ message: 'User is already registered as a driver' });
            }

            driver = new Driver({
                user: userId,
                licenseNumber: licenseDetails.number,
                licenseExpiry: licenseDetails.expiry,
                vehicle: vehicleId, // referencing Vehicle model ID
                status: 'pending' // pending verification
            });

            await driver.save();
            res.status(201).json({ message: 'Driver application submitted', driver });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getDriverDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const driver = await Driver.findById(id).populate('user').populate('vehicle');

            if (!driver) {
                return res.status(404).json({ message: 'Driver not found' });
            }

            res.status(200).json(driver);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = driverController;
