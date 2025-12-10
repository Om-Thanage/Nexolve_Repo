const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Helper to wrap async routes
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', catchAsync(userController.createUser));
router.get('/:clerkId', catchAsync(userController.getUserProfile));
router.put('/:clerkId/preferences', catchAsync(userController.updatePreferences));
router.get('/:id', catchAsync(userController.getName));

module.exports = router;
