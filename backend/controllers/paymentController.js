const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const Payment = require("../models/Payment");
const RideRequest = require("../models/RideRequest");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentController = {
  initiateSplitPayment: async (req, res) => {
    try {
      const { tripId, userIds, totalAmount } = req.body;
      // Logic to split amount among users
      const splitAmount = totalAmount / userIds.length; // Simple equal split for now

      const payments = await Promise.all(
        userIds.map(async (uid) => {
          const user = await User.findById(uid);
          if (!user) throw new Error(`User ${uid} not found`);

          // Create Razorpay Payment Link
          const paymentLink = await razorpay.paymentLink.create({
            amount: Math.round(splitAmount * 100), // Amount in paise
            currency: "INR",
            accept_partial: false,
            description: `Payment for Trip ${tripId}`,
            customer: {
              name: user.name,
              email: user.email,
              contact: user.phone || "+919876543210", // Fallback if no phone
            },
            notify: {
              sms: false,
              email: true,
            },
            reminder_enable: true,
            callback_url: "http://localhost:3000/api/payments/callback-success", // Placeholder
            callback_method: "get",
          });

          const payment = new Payment({
            trip: tripId,
            user: uid,
            amount: splitAmount,
            method: "razorpay",
            status: "pending",
            commission: splitAmount * 0.1, // 10% commission
            razorpayOrderId: paymentLink.id, // Storing link ID as order ID ref
            transactionId: paymentLink.short_url, // Storing URL for reference
          });
          return payment.save();
        })
      );

      res.status(201).json({ message: "Split payments initiated", payments });
    } catch (error) {
      console.error("Payment Init Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  handleWebhook: async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest === req.headers["x-razorpay-signature"]) {
        console.log("Webhook verified");
        const event = req.body;

        if (event.event === "payment.link.paid") {
          const paymentLinkId = event.payload.payment_link.entity.id;
          const paymentId =
            event.payload.payment_link.entity.payments[0]?.payment_id; // Get first payment ID

          // Update Payment status
          const payment = await Payment.findOne({
            razorpayOrderId: paymentLinkId,
          });
          if (payment) {
            payment.status = "completed";
            payment.razorpayPaymentId = paymentId;
            await payment.save();
            console.log(`Payment ${payment._id} marked as completed`);
          }
        }
        res.json({ status: "ok" });
      } else {
        console.log("Webhook signature mismatch");
        res.status(403).json({ message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  handleCallbackSuccess: async (req, res) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_payment_link_id,
        razorpay_payment_link_status,
      } = req.query;

      if (razorpay_payment_link_status === "paid") {
        const payment = await Payment.findOne({
          razorpayOrderId: razorpay_payment_link_id,
        });

        if (payment) {
          if (payment.status !== "completed") {
            payment.status = "completed";
            payment.razorpayPaymentId = razorpay_payment_id;
            await payment.save();
            console.log(
              `Payment ${payment._id} marked as completed via callback`
            );

            // Update RideRequest payment status
            await RideRequest.findOneAndUpdate(
              { trip: payment.trip, user: payment.user },
              { paymentStatus: "paid" }
            );
          }
        } else {
          console.error(
            `Payment not found for link ID: ${razorpay_payment_link_id}`
          );
        }
      }

      // Redirect to the frontend application
      res.redirect("http://localhost:5173/");
    } catch (error) {
      console.error("Callback Error:", error);
      res.status(500).send("An error occurred during payment callback.");
    }
  },
};

module.exports = paymentController;
