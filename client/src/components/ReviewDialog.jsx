import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import api from "../api";

export default function ReviewDialog({
  isOpen,
  onClose,
  tripId,
  reviewerId,
  revieweeId,
  revieweeName,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating");

    setLoading(true);
    try {
      await api.post("/reviews", {
        tripId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
              >
                <Star size={32} fill="currentColor" />
              </motion.div>
              <h3 className="text-xl font-bold">Review Submitted!</h3>
              <p className="text-muted-foreground">
                Thank you for your feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Rate your Driver</h3>
                <p className="text-muted-foreground text-sm">
                  How was your ride with {revieweeName}?
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)..."
                className="w-full p-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary outline-none transition-all resize-none h-24 text-sm"
              />

              {/* Actions */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
