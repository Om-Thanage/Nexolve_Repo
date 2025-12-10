/**
 * Carbon Service
 * Calculates estimated carbon footprint savings.
 */

const carbonService = {
    /**
     * Calculate carbon savings for a carpool trip vs solo driving.
     * Average passenger vehicle emits ~120g CO2 per km.
     * 
     * @param {Number} distanceKm - Trip distance in km
     * @param {Number} passengers - Number of passengers (excluding driver)
     * @returns {Number} savingsKg - Savings in kg CO2
     */
    calculateSavings: (distanceKm, passengers) => {
        const avgEmissionPerKm = 0.120; // kg CO2
        // Savings = (Solo Emissions * Passengers) - (Shared Ride Extra Load approx 0)

        const totalSavings = distanceKm * avgEmissionPerKm * passengers;
        return parseFloat(totalSavings.toFixed(2));
    }
};

module.exports = carbonService;
