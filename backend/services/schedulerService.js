const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');

const schedulerService = {
    // Map JS getDay() (0-6 Sun-Sat) to Schedule days strings
    getDayName: (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    },

    processRecurringSchedules: async () => {
        console.log("Processing recurring schedules...");

        // Target: Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayName = schedulerService.getDayName(tomorrow);

        console.log(`Checking schedules for ${dayName}, ${tomorrow.toDateString()}`);

        try {
            // Find valid Driver schedules for tomorrow
            const schedules = await Schedule.find({
                type: 'driver',
                isActive: true,
                "pattern.days": dayName
            }).populate('user');

            console.log(`Found ${schedules.length} active schedules.`);

            for (const schedule of schedules) {
                // Construct Start Time for tomorrow
                // schedule.timeWindow.start format "HH:MM"
                const [hours, minutes] = schedule.timeWindow.start.split(':').map(Number);

                const tripStartTime = new Date(tomorrow);
                tripStartTime.setHours(hours, minutes, 0, 0);

                // Check if trip already exists for this Host + Time
                // We need to find the Driver doc for this User
                const driver = await Driver.findOne({ user: schedule.user._id });
                if (!driver) {
                    console.log(`Driver profile not found for user ${schedule.user.email}`);
                    continue;
                }

                const exists = await Trip.findOne({
                    host: driver._id,
                    startTime: tripStartTime,
                    status: 'scheduled'
                });

                if (!exists) {
                    // Create Trip
                    const newTrip = new Trip({
                        host: driver._id,
                        startLocation: schedule.origin,
                        endLocation: schedule.destination,
                        startTime: tripStartTime,
                        status: 'scheduled',
                        farePerSeat: 50, // Default or fetch from preference (not in Schedule schema yet)
                        availableSeats: 3, // Default or fetch from Vehicle
                        carbonSavings: 0 // Will be calc'd later
                    });

                    await newTrip.save();
                    console.log(`Created auto-trip for driver ${driver._id} at ${tripStartTime}`);
                } else {
                    console.log(`Trip already exists for driver ${driver._id} at ${tripStartTime}`);
                }
            }
        } catch (error) {
            console.error("Scheduler Error:", error);
        }
    },

    init: () => {
        // Run every day at midnight: 0 0 * * *
        // For waiting/testing purposes, we can run it now or set a tighter cron
        cron.schedule('0 0 * * *', () => {
            schedulerService.processRecurringSchedules();
        });
        console.log("Scheduler initialized (Daily at 00:00)");
    }
};

module.exports = schedulerService;
