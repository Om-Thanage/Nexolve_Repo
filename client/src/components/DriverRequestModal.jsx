import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, X, MapPin } from 'lucide-react';

export default function DriverRequestModal({ request, onAccept, onDecline }) {
    if (!request) return null;

    const rider = request.user || {};
    const trip = request.trip || {};

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-background w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden"
                >
                    <div className="bg-primary p-4 text-primary-foreground">
                        <h2 className="text-lg font-bold">New Ride Request!</h2>
                        <p className="text-sm opacity-90">Someone wants to join your trip</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Rider Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                                {rider.profilePhoto ? (
                                    <img src={rider.profilePhoto} alt={rider.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-bold">
                                        {rider.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{rider.name || 'Rider'}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <User size={12} />
                                    <span>{request.seatsRequested || 1} seat(s) requested</span>
                                </div>
                            </div>
                        </div>

                        {/* Trip Context - simplify for now */}
                        <div className="bg-secondary/30 p-3 rounded-xl space-y-2 border border-border/50">
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="mt-1 text-green-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Picking up near</p>
                                    <p className="font-medium text-sm">{trip.startLocation?.address || 'Start Point'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onDecline}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border font-medium hover:bg-secondary/80 transition-colors"
                            >
                                <X size={18} />
                                Decline
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                <Check size={18} />
                                Accept
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
