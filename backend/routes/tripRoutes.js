const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', catchAsync(tripController.createTrip));
router.get('/search', catchAsync(tripController.searchTrips));
router.get('/:id', catchAsync(tripController.getTripDetails));
router.put('/:id/status', catchAsync(tripController.updateTripStatus));

module.exports = router;
