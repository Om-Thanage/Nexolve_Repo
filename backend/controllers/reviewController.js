const Review = require("../models/Review");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

const reviewController = {
  addReview: async (req, res) => {
    try {
      const { tripId, reviewerId, revieweeId, rating, comment } = req.body;

      // Simple validation
      if (!tripId || !reviewerId || !revieweeId || !rating) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create Review
      const review = new Review({
        trip: tripId,
        reviewer: reviewerId,
        reviewee: revieweeId,
        rating,
        comment,
      });
      await review.save();

      // Update Driver's Average Rating
      // 1. Find the driver associated with the reviewee (which is a User ID)
      const driver = await Driver.findOne({ user: revieweeId });

      if (driver) {
        // 2. Recalculate average
        // We can aggregate or just incremental update.
        // For accuracy, let's aggregate all reviews for this driver (via user id match on reviewee)
        const stats = await Review.aggregate([
          { $match: { reviewee: new mongoose.Types.ObjectId(revieweeId) } },
          {
            $group: {
              _id: "$reviewee",
              avgRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ]);

        if (stats.length > 0) {
          driver.rating = parseFloat(stats[0].avgRating.toFixed(1));
          driver.totalTrips = driver.totalTrips + 1; // Or rely on actual trip counts, but incrementing here is a simple heuristic if 'totalTrips' implies 'rated trips' or 'completed trips'
          await driver.save();
        }
      }

      res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
      console.error("Add Review Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

const mongoose = require("mongoose");
module.exports = reviewController;
