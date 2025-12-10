const User = require('../models/user');
const Trip = require('../models/Trip');

const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalTrips = await Trip.countDocuments();

            // Calc total carbon saved
            const trips = await Trip.find({ status: 'completed' });
            const totalCarbonSaved = trips.reduce((acc, trip) => acc + (trip.carbonSavings || 0), 0);

            res.status(200).json({
                totalUsers,
                totalTrips,
                totalCarbonSaved,
                activeMatchRate: '85%' // Mock metric
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = adminController;
