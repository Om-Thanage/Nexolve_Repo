const Vehicle = require('../models/Vehicle');

const vehicleController = {
    // Create a new vehicle
    createVehicle: async (req, res) => {
        try {
            const { driver, model, plateNumber, capacity, fuelType, condition, photo } = req.body;

            // Check if vehicle with same plate number exists
            const existingVehicle = await Vehicle.findOne({ plateNumber });
            if (existingVehicle) {
                return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
            }

            const vehicle = new Vehicle({
                driver, // Expecting Driver ID passed from frontend
                model,
                plateNumber,
                capacity,
                fuelType,
                condition,
                photo
            });

            await vehicle.save();

            // Link vehicle to driver
            await require('../models/Driver').findByIdAndUpdate(driver, { vehicle: vehicle._id });

            res.status(201).json({ message: 'Vehicle added successfully', vehicle });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get all vehicles for a driver
    getVehiclesByDriver: async (req, res) => {
        try {
            const { driverId } = req.query;
            if (!driverId) {
                return res.status(400).json({ message: 'Driver ID is required' });
            }
            const vehicles = await Vehicle.find({ driver: driverId });
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get a single vehicle by ID
    getVehicleById: async (req, res) => {
        try {
            const vehicle = await Vehicle.findById(req.params.id);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }
            res.status(200).json(vehicle);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Update a vehicle
    updateVehicle: async (req, res) => {
        try {
            const { model, capacity, fuelType, condition, photo } = req.body;

            let vehicle = await Vehicle.findById(req.params.id);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }

            vehicle.model = model || vehicle.model;
            vehicle.capacity = capacity || vehicle.capacity;
            vehicle.fuelType = fuelType || vehicle.fuelType;
            vehicle.condition = condition || vehicle.condition;
            vehicle.photo = photo || vehicle.photo;

            await vehicle.save();
            res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Delete a vehicle
    deleteVehicle: async (req, res) => {
        try {
            const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }
            res.status(200).json({ message: 'Vehicle deleted successfully' });

            // Unlink from driver
            await require('../models/Driver').findOneAndUpdate({ vehicle: req.params.id }, { $unset: { vehicle: 1 } });
        } catch (error) {
            console.error("Delete error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = vehicleController;
