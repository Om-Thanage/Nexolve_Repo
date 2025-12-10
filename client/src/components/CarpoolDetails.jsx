import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Clock, Car } from 'lucide-react';

export default function CarpoolDetails({ ride, onBack, onRequest }) {
    if (!ride) return null;

    console.log(ride);

    const host = ride.host || {};
    const driverUser = host.user || {}; // Access the user details from the host object

    const vehicle = ride.vehicle || host.vehicle || {};

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-background rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] border-t border-border md:w-96 md:left-auto md:right-8 md:bottom-8 md:rounded-3xl md:h-auto flex flex-col max-h-[85vh]"
        >
            {/* Handle for mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={onBack}>
                <div className="w-12 h-1.5 bg-muted rounded-full opacity-50" />
            </div>

            <div className="p-5 space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{driverUser.name || 'Driver'}'s Ride</h2>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                                <ShieldCheck size={12} /> Verified
                            </span>
                            <span>• {vehicle.plateNumber || 'Unknown Plate'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold flex items-center justify-end">
                            ₹{ride.farePerSeat}
                        </div>
                        <span className="text-xs text-muted-foreground">per seat</span>
                    </div>
                </div>

                {/* Route/Time Info */}
                <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-xl border border-border/50">
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Pick-up</p>
                        <p className="font-bold text-sm truncate">{ride.startLocation?.address?.split(',')[0] || 'Nearby'}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-border"></div>
                    <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-1 text-primary">
                            <Clock size={14} />
                            <span className="font-bold">
                                {ride.startTime ? new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Departure</p>
                    </div>
                </div>

                {/* Driver Profile */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden">
                        {driverUser.profilePhoto ? (
                            <img src={driverUser.profilePhoto} alt={driverUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                                {driverUser.name?.[0] || 'D'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-base">{driverUser.name || 'Driver'} • {vehicle.model || 'Vehicle'}</p>
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{host.rating || 'New'}</span>
                            <span className="text-sm text-muted-foreground">({host.totalTrips || 0} rides)</span>
                        </div>
                    </div>
                </div>

                {/* Vehicle Pill */}
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-secondary rounded-lg text-xs font-medium flex items-center gap-1">
                        <Car size={14} /> {vehicle.model || 'Car'}
                    </span>
                    <span className="px-3 py-1 bg-secondary rounded-lg text-xs font-medium">
                        {vehicle.fuelType || 'Fuel'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-3">
                    <button
                        onClick={() => onRequest(ride)}
                        className="w-full bg-foreground text-background font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                    >
                        Request Ride
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-3 text-sm text-muted-foreground font-medium hover:text-foreground"
                    >
                        View other options
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
