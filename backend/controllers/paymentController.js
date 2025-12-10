const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentController = {
    initiateSplitPayment: async (req, res) => {
        try {
            const { tripId, userIds, totalAmount } = req.body;
            // Logic to split amount among users
            const splitAmount = totalAmount / userIds.length; // Simple equal split for now

            const payments = await Promise.all(userIds.map(async (uid) => {
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
                        contact: user.phone || "+919999999999" // Fallback if no phone
                    },
                    notify: {
                        sms: false,
                        email: true
                    },
                    reminder_enable: true,
                    callback_url: "http://localhost:3000/api/payments/callback-success", // Placeholder
                    callback_method: "get"
                });

                const payment = new Payment({
                    trip: tripId,
                    user: uid,
                    amount: splitAmount,
                    method: 'razorpay',
                    status: 'pending',
                    commission: splitAmount * 0.1, // 10% commission
                    razorpayOrderId: paymentLink.id, // Storing link ID as order ID ref
                    transactionId: paymentLink.short_url // Storing URL for reference
                });
                return payment.save();
            }));

            res.status(201).json({ message: 'Split payments initiated', payments });
        } catch (error) {
            console.error("Payment Init Error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    handleWebhook: async (req, res) => {
        try {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
            const shasum = crypto.createHmac('sha256', secret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest('hex');

            if (digest === req.headers['x-razorpay-signature']) {
                console.log('Webhook verified');
                const event = req.body;

                if (event.event === 'payment.link.paid') {
                    const paymentLinkId = event.payload.payment_link.entity.id;
                    const paymentId = event.payload.payment_link.entity.payments[0]?.payment_id; // Get first payment ID

                    // Update Payment status
                    const payment = await Payment.findOne({ razorpayOrderId: paymentLinkId });
                    if (payment) {
                        payment.status = 'completed';
                        payment.razorpayPaymentId = paymentId;
                        await payment.save();
                        console.log(`Payment ${payment._id} marked as completed`);
                    }
                }
                res.json({ status: 'ok' });
            } else {
                console.log('Webhook signature mismatch');
                res.status(403).json({ message: 'Invalid signature' });
            }
        } catch (error) {
            console.error("Webhook Error:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = paymentController;
