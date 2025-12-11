const RideRequest = require("../models/RideRequest");
const Trip = require("../models/Trip");
const notificationService = require("../services/notificationService");
const User = require("../models/user");

const rideRequestController = {
  createRequest: async (req, res) => {
    try {
      const { tripId, userId, seatsNeeded, note } = req.body;

      const trip = await Trip.findById(tripId).populate("host");
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      if (trip.availableSeats < seatsNeeded) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      const request = new RideRequest({
        trip: tripId,
        user: userId,
        status: "requested",
        note,
      });

      await request.save();

      // Notify Driver
      const rider = await User.findById(userId);
      if (trip.host) {
        // Driver host has ref to user.
        // We need to fetch that user to get email.
        // Assuming trip.host is a Driver document (populated above)
        const driver = trip.host;
        // Fetch user from driver
        const driverUser = await User.findById(driver.user);
        if (driverUser) {
          await notificationService.notifyTripJoinRequest(
            driverUser.email,
            rider ? rider.name : "Unknown",
            tripId
          );
        }
      }

      res.status(201).json({ message: "Request sent to driver", request });
    } catch (error) {
      console.error("Create Request Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  updateRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // accepted, rejected

      const request = await RideRequest.findById(id)
        .populate("trip")
        .populate("user");
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (status === "accepted") {
        const trip = await Trip.findById(request.trip._id).populate("host");
        if (trip.availableSeats < 1) {
          return res.status(400).json({ message: "Trip is full" });
        }

        // Decrement seats
        trip.availableSeats -= 1;
        trip.participants.push(request.user._id);
        await trip.save();

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        request.otp = otp;

        // Notify Rider
        const driverUser = await User.findById(trip.host.user);
        await notificationService.notifyRequestAccepted(
          request.user.email,
          driverUser ? driverUser.name : "Your Driver"
        );
      }

      if (status === "rejected") {
        const trip = await Trip.findById(request.trip._id).populate("host");
        const driverUser = await User.findById(trip.host.user);

        // Notify Rider
        await notificationService.notifyRequestRejected(
          request.user.email,
          driverUser ? driverUser.name : "Driver"
        );
      }

      if (status === "ongoing") {
        // Verify OTP
        const { otp } = req.body;
        if (!otp || request.otp !== otp) {
          return res.status(400).json({ message: "Invalid OTP" });
        }
        // Verify success -> proceed to update status
      }

      request.status = status;
      await request.save();

      res.status(200).json({ message: `Request ${status}`, request });
    } catch (error) {
      console.error("Update Request Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getPendingRequests: async (req, res) => {
    try {
      const { userId } = req.query;

      // 1. Fetch Incoming Requests (Requesting MY trips)
      const Driver = require("../models/Driver");
      const driver = await Driver.findOne({ user: userId });

      let incoming = [];
      if (driver) {
        const trips = await Trip.find({ host: driver._id });
        const tripIds = trips.map((t) => t._id);
        incoming = await RideRequest.find({
          trip: { $in: tripIds },
          status: {
            $in: ["requested", "accepted", "arrived", "ongoing", "completed"],
          },
        })
          .populate("user")
          .populate("trip");
      }

      // 2. Fetch Outgoing Requests (I am requesting OTHERS' trips)
      const outgoing = await RideRequest.find({
        user: userId,
      })
        .populate("user")
        .populate({
          path: "trip",
          populate: {
            path: "host",
            populate: {
              path: "user",
              model: "User",
            },
          },
        });

      // Filter out 'completed' requests that are also 'paid' (archived in effect)
      // Filter out 'archived' requests
      const filteredOutgoing = outgoing.filter((req) => {
        if (req.archived) {
          return false; // hide archived
        }
        return true;
      });

      // Also filter incoming 'completed' + 'paid' for driver view if desired?
      // For now, let's just clean up the polling response for outgoing (rider) side which is the immediate issue.

      res.status(200).json({ incoming, outgoing: filteredOutgoing });
    } catch (error) {
      console.error("Fetch Pending Requests Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  updateRequestOtp: async (req, res) => {
    try {
      const { id } = req.params;
      const { otp } = req.body;

      const request = await RideRequest.findById(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      request.otp = otp;
      await request.save();

      res.status(200).json({ message: "OTP updated", request });
    } catch (error) {
      console.error("Update Request OTP Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  archiveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const request = await RideRequest.findById(id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      request.archived = true;
      await request.save();

      res.json({ message: "Request archived" });
    } catch (error) {
      console.error("Archive Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = rideRequestController;
