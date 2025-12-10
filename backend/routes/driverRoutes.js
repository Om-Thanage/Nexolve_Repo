const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', catchAsync(driverController.registerDriver));
router.get('/user/:userId', catchAsync(driverController.getDriverByUserId));
router.get('/:id', catchAsync(driverController.getDriverDetails));

module.exports = router;
