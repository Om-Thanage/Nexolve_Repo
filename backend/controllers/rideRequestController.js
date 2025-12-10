const RideRequest = require('../models/RideRequest');
const Trip = require('../models/Trip');
const notificationService = require('../services/notificationService');
const User = require('../models/user');

const rideRequestController = {
    createRequest: async (req, res) => {
        try {
            const { tripId, userId, seatsNeeded, note } = req.body;

            const trip = await Trip.findById(tripId).populate('host');
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            if (trip.availableSeats < seatsNeeded) {
                return res.status(400).json({ message: 'Not enough seats available' });
            }

            const request = new RideRequest({
                trip: tripId,
                user: userId,
                status: 'requested',
                note
            });

            await request.save();

            // Notify Driver
            const rider = await User.findById(userId);
            if (trip.host) {
                // Driver host has ref to user. 
                // We need to fetch that user to get email.
                // Assuming trip.host is a Driver document (populated above)
                const driver = trip.host;
                // Fetch user from driver
                const driverUser = await User.findById(driver.user);
                if (driverUser) {
                    await notificationService.notifyTripJoinRequest(driverUser.email, rider ? rider.name : 'Unknown', tripId);
                }
            }

            res.status(201).json({ message: 'Request sent to driver', request });
        } catch (error) {
            console.error("Create Request Error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updateRequestStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // accepted, rejected

            const request = await RideRequest.findById(id).populate('trip').populate('user');
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }

            if (status === 'accepted') {
                const trip = await Trip.findById(request.trip._id).populate('host');
                if (trip.availableSeats < 1) {
                    return res.status(400).json({ message: 'Trip is full' });
                }

                // Decrement seats
                trip.availableSeats -= 1;
                trip.participants.push(request.user._id);
                await trip.save();

                // Notify Rider
                const driverUser = await User.findById(trip.host.user);
                await notificationService.notifyRequestAccepted(request.user.email, driverUser ? driverUser.name : 'Your Driver');
            }

            request.status = status;
            await request.save();

            res.status(200).json({ message: `Request ${status}`, request });
        } catch (error) {
            console.error("Update Request Error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getPendingRequests: async (req, res) => {
        try {
            const { userId } = req.query; // Or from auth middleware

            // 1. Find Driver profile for this user
            // Assuming we imported Driver model at top (need to add it)
            const Driver = require('../models/Driver');
            const driver = await Driver.findOne({ user: userId });

            if (!driver) {
                // If not a driver, maybe they are a rider checking status? 
                // But this endpoint is for fetching incoming requests.
                return res.status(200).json([]);
            }

            // 2. Find Trips by this driver
            const trips = await Trip.find({ host: driver._id });
            const tripIds = trips.map(t => t._id);

            // 3. Find Requests for these trips
            const requests = await RideRequest.find({
                trip: { $in: tripIds },
                status: 'requested'
            }).populate('user').populate('trip');

            res.status(200).json(requests);
        } catch (error) {
            console.error("Fetch Pending Requests Error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = rideRequestController;
