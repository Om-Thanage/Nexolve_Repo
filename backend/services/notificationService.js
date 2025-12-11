// const nodemailer = require('nodemailer'); // Disabled as per user request
// Notification Service - Mock Only

const notificationService = {
    sendEmail: async (to, subject, text, html) => {
        // Mock email sending - just log to console
        console.log(`[Email Notification]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text}`);
        return { response: 'Email logged' };
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
    },

    notifyRequestRejected: async (riderEmail, driverName) => {
        const subject = "Ride Request Update";
        const text = `Start looking for another ride. ${driverName} has declined your request.`;
        await notificationService.sendEmail(riderEmail, subject, text);
    }
};

module.exports = notificationService;
