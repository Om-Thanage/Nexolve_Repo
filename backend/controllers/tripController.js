const Trip = require('../models/Trip');
const matchingService = require('../services/matchingService');
const carbonService = require('../services/carbonService');

const tripController = {
    createTrip: async (req, res) => {
        try {
            // Driver offers a ride
            const { hostId, startLocation, endLocation, startTime, farePerSeat, availableSeats, routeGeometry, vehicle } = req.body;

            const trip = new Trip({
                host: hostId,
                vehicle, // Added vehicle reference
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
            }).populate({
                path: 'host',
                populate: [
                    { path: 'vehicle', model: 'Vehicle' },
                    { path: 'user', model: 'User' }
                ]
            }).sort({ startTime: 1 });

            res.status(200).json(trips);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    searchTrips: async (req, res) => {
        try {
            const { startLat, startLng, endLat, endLng, startTime } = req.query;
            const radiusKm = 5; // Search within 5km of start
            const endRadiusKm = 5; // Search within 5km of destination

            if (!startLat || !startLng) {
                return res.status(400).json({ message: 'Start coordinates required' });
            }

            // 1. Find trips starting near the user's start location
            // Note: MongoDB requires a 2dsphere index on startLocation for $near
            let candidates = await Trip.find({
                startLocation: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(startLng), parseFloat(startLat)]
                        },
                        $maxDistance: radiusKm * 1000 // meters
                    }
                },
                status: { $in: ['pending', 'scheduled'] },
                availableSeats: { $gt: 0 },
                // Optional: Filter by time if provided
                // startTime: { $gte: new Date(startTime || Date.now()) } 
            }).populate({
                path: 'host',
                populate: [
                    { path: 'vehicle', model: 'Vehicle' },
                    { path: 'user', model: 'User' }
                ]
            });

            // 2. Filter by end location if provided
            if (endLat && endLng) {
                const { getDistance } = require('geolib');
                candidates = candidates.filter(trip => {
                    if (!trip.endLocation || !trip.endLocation.coordinates) return false;

                    const dist = getDistance(
                        { latitude: parseFloat(endLat), longitude: parseFloat(endLng) },
                        { latitude: trip.endLocation.coordinates[1], longitude: trip.endLocation.coordinates[0] }
                    );

                    // Convert meters to km and check
                    return dist <= (endRadiusKm * 1000);
                });
            }

            res.status(200).json(candidates);
        } catch (error) {
            console.error("Search Error:", error);
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
