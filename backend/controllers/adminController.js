const User = require('../models/user');
const Trip = require('../models/Trip');
const Payment = require('../models/Payment');

const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalTrips = await Trip.countDocuments();
            const activeDrivers = await User.countDocuments({ role: 'driver' });

            // Calc total carbon saved
            const trips = await Trip.find({ status: 'completed' });
            const totalCarbonSaved = trips.reduce((acc, trip) => acc + (trip.carbonSavings || 0), 0);

            // Calc Revenue (20% of completed payments)
            const payments = await Payment.find({ status: 'completed' });
            const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);
            const totalRevenue = totalVolume * 0.20;

            // Recent Activity (Last 5 users and Last 5 trips merged)
            const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
            const recentTrips = await Trip.find().sort({ createdAt: -1 }).limit(5).populate('host', 'name').lean();

            const activity = [
                ...recentUsers.map(u => ({
                    id: u._id,
                    user: u.name,
                    action: 'User Signup',
                    status: 'Completed',
                    time: u.createdAt,
                    type: 'user'
                })),
                ...recentTrips.map(t => ({
                    id: t._id,
                    user: t.host?.name || 'Unknown Driver',
                    action: 'New Trip Posted',
                    status: t.status,
                    time: t.createdAt,
                    type: 'trip'
                }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

            // Weekly Engagement (Trips per day of week)
            // Using a simple aggregation to count trips by day of week
            const engagement = await Trip.aggregate([
                {
                    $group: {
                        _id: { $dayOfWeek: "$createdAt" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Map 1-7 (Sun-Sat) to labels
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const graphData = days.map((day, index) => {
                const found = engagement.find(e => e._id === index + 1);
                return { label: day, height: found ? `h - ${Math.min(found.count * 4, 32)} ` : 'h-2', value: found ? found.count : 0 };
            });

            res.status(200).json({
                totalUsers,
                activeDrivers,
                totalTrips,
                totalCarbonSaved,
                totalRevenue,
                activity,
                graphData
            });
        } catch (error) {
            console.error('Admin Stats Error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getDrivers: async (req, res) => {
        try {
            const drivers = await User.find({ role: 'driver' }).select('-password').sort({ createdAt: -1 });
            res.status(200).json(drivers);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = adminController;
