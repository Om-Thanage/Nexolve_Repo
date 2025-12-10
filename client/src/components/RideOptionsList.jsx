import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RideOptionCard from './RideOptionCard';

export default function RideOptionsList({ rides, alternatives = [], onSelect, selectedId }) {
    const userId = localStorage.getItem('userId');
    const filteredRides = rides.filter(r => {
        const hostUserId = r.host?.user?._id || r.host?.user;
        return hostUserId !== userId;
    });

    const allOptions = [
        ...filteredRides.map(r => ({
            id: r._id,
            type: 'car',
            title: r.vehicle?.model || 'Car',
            price: r.farePerSeat,
            seats: r.availableSeats,
            eta: Math.floor(Math.random() * 10) + 2, // Mock ETA for now
            desc: r.host?.user?.name || 'Driver',
            original: r // Use this to pass full data for details view
        })),
        ...alternatives
    ];

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-20 bg-background rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] border-t border-border md:w-96 md:left-auto md:right-8 md:bottom-8 md:rounded-3xl md:h-[600px] md:overflow-hidden flex flex-col"
        >
            {/* Handle for mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-12 h-1.5 bg-muted rounded-full opacity-50" />
            </div>

            <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm z-10">
                <h2 className="text-lg font-bold">Choose a ride</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe">
                {allOptions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        No rides available right now.
                    </div>
                ) : (
                    allOptions.map((opt, i) => (
                        <RideOptionCard
                            key={opt.id || i}
                            option={opt}
                            selected={selectedId}
                            onClick={() => onSelect(opt)}
                        />
                    ))
                )}
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-border bg-background z-10 pb-8 md:pb-4">
                <button
                    className="w-full bg-foreground text-background font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={!selectedId}
                >
                    {selectedId ? 'Confirm Ride' : 'Select an option'}
                </button>
            </div>
        </motion.div>
    );
}
