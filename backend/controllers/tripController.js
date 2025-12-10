const Trip = require('../models/Trip');
const matchingService = require('../services/matchingService');
const carbonService = require('../services/carbonService');

const tripController = {
    createTrip: async (req, res) => {
        try {
            // Driver offers a ride
            const { hostId, startLocation, endLocation, startTime, farePerSeat, availableSeats, routeGeometry } = req.body;

            const trip = new Trip({
                host: hostId,
                startLocation, // { type: 'Point', coordinates: [lng, lat], address: '' }
                endLocation,
                startTime,
                farePerSeat,
                availableSeats,
                routeGeometry,
                status: 'pending'
            });

            await trip.save();
            res.status(201).json({ message: 'Trip created successfully', trip });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getAllTrips: async (req, res) => {
        try {
            // Return all upcoming trips with available seats
            const trips = await Trip.find({
                status: 'pending',
                startTime: { $gte: new Date() },
                availableSeats: { $gt: 0 }
            }).populate('host').sort({ startTime: 1 });

            res.status(200).json(trips);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    searchTrips: async (req, res) => {
        try {
            const { startLat, startLng, endLat, endLng, startTime } = req.query;

            // 1. Find potential candidate trips from DB (e.g., future trips, has seats)
            // Ideally use geospatial query here to filter broadly first
            const candidates = await Trip.find({
                status: { $in: ['pending', 'scheduled'] },
                startTime: { $gte: new Date(startTime) },
                availableSeats: { $gt: 0 }
            }).populate('host');

            // 2. Use matching service to score/rank
            const requestCriteria = {
                startLocation: [parseFloat(startLng), parseFloat(startLat)],
                endLocation: [parseFloat(endLng), parseFloat(endLat)],
                startTime: new Date(startTime)
            };

            const matches = await matchingService.findMatches(candidates, requestCriteria);

            res.status(200).json(matches);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getTripDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const trip = await Trip.findById(id)
                .populate('host')
                .populate('participants', 'name email profilePhoto');

            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updateTripStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // active, completed, cancelled

            const trip = await Trip.findById(id);
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            trip.status = status;

            if (status === 'completed') {
                // Calculate and finalize carbon savings
                // Estimate distance based on geometry or simply displacement for now
                const distance = 10; // Mock distance in km, really should be stored or calc'd
                trip.carbonSavings = carbonService.calculateSavings(distance, trip.participants.length);
            }

            await trip.save();
            res.status(200).json({ message: 'Trip status updated', trip });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = tripController;
