const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/dashboard', catchAsync(adminController.getDashboardStats));

module.exports = router;
