const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/split', catchAsync(paymentController.initiateSplitPayment));
router.post('/webhook', catchAsync(paymentController.handleWebhook));

module.exports = router;
