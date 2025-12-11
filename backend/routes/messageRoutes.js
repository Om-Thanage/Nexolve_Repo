const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Helper to wrap async routes (reusing pattern from other routes if valid, or just simple inline)
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/:id", catchAsync(messageController.getMessages));
router.post("/send/:id", catchAsync(messageController.sendMessage));

module.exports = router;
