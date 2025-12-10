const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
// const authMiddleware = require('../middleware/authMiddleware');

// Public routes for now (matching other routes)
// router.use(authMiddleware);

router.post('/', vehicleController.createVehicle);
router.get('/', vehicleController.getVehiclesByDriver);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
