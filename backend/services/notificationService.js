const nodemailer = require('nodemailer');

/**
 * Notification Service
 * Sends emails (and potentially SMS in future)
 */

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g. 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const notificationService = {
    sendEmail: async (to, subject, text, html) => {
        if (!process.env.EMAIL_USER) {
            console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw, just log. Notifications shouldn't break core flow.
        }
    },

    notifyTripJoinRequest: async (driverEmail, riderName, tripId) => {
        const subject = "New Ride Request";
        const text = `${riderName} has requested to join your trip. Check your dashboard to accept.`;
        await notificationService.sendEmail(driverEmail, subject, text);
    },

    notifyRequestAccepted: async (riderEmail, driverName) => {
        const subject = "Ride Request Accepted!";
        const text = `Good news! ${driverName} has accepted your request.`;
        await notificationService.sendEmail(riderEmail, subject, text);
    }
};

module.exports = notificationService;
