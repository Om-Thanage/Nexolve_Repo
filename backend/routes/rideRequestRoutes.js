const express = require('express');
const router = express.Router();
const rideRequestController = require('../controllers/rideRequestController');

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', catchAsync(rideRequestController.createRequest));
router.put('/:id/status', catchAsync(rideRequestController.updateRequestStatus));

module.exports = router;
