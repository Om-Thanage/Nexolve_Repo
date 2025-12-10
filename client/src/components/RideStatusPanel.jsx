import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Shield, CheckCircle2, Navigation as NavIcon } from 'lucide-react';

export default function RideStatusPanel({ ride, onReset }) {
    // States: 'meeting' -> 'otp' -> 'inprogress' -> 'payment' -> 'completed'
    const [status, setStatus] = useState('meeting');
    const [otp, setOtp] = useState(['', '', '', '']);

    // Mock functionality for hackathon
    const handleReached = () => setStatus('otp');

    const verifyOtp = () => {
        // Mock verification
        if (otp.join('').length === 4) {
            setStatus('inprogress');
        }
    };

    const handleArrivedDest = () => setStatus('payment');

    const handlePay = () => {
        // Mock Payment
        setStatus('completed');
        setTimeout(() => {
            onReset(); // Go back to home
        }, 2000);
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] border-t border-border md:w-96 md:left-auto md:right-8 md:bottom-8 md:rounded-3xl flex flex-col overflow-hidden"
        >
            {/* Header / Driver Info - Always Visible */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">{status === 'meeting' ? 'Driver is arriving' : status === 'inprogress' ? 'Heading to destination' : status === 'otp' ? 'Verify Ride' : 'Ride Completed'}</h3>
                    <p className="text-primary-foreground/80 text-sm">
                        {status === 'meeting' ? '2 min away' : status === 'inprogress' ? '15 min remaining' : 'Please check details'}
                    </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <NavIcon size={20} className="text-white" />
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Driver Actions - Only for Demo purposes we show 'I Reached' on User side 
                     or we assume this UI is for the Rider and the Driver has a separate UI?
                     User said: "once the user meets the rider(add a button on the rider's UI to have reached the user's location...)"
                     Wait, user said "once user meets rider" -> User is usually the Rider? Or Driver?
                     "User selects carpool... then once the user meets the rider... add a button on the rider's UI".
                     I'll assume 'Rider' = current User.
                     So Rider clicks "I've met the driver"? Or Driver marks "I've arrived"?
                     "add a button on the rider's UI to have reached the user's location" -> This is ambiguous. 
                     Usually Driver marks "Arrived". 
                     But for hackathon single-screen flow, I will add "Driver Arrived" button here to simulate driver action.
                 */}

                {status === 'meeting' && (
                    <div className="space-y-4">
                        <div className="bg-secondary/30 p-4 rounded-xl text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Share this OTP with driver</p>
                            <div className="text-3xl font-mono font-bold tracking-widest text-primary">4812</div>
                        </div>
                        <button onClick={handleReached} className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 font-bold text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-foreground transition-all">
                            🚧 Demo: Driver Arrived at Pickup
                        </button>
                    </div>
                )}

                {status === 'otp' && (
                    <div className="space-y-4">
                        <p className="text-center font-medium">Driver entering OTP...</p>
                        <div className="flex justify-center gap-3">
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-0"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
                        </div>
                        <button onClick={verifyOtp} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700">
                            🚧 Demo: Verify OTP (Start Ride)
                        </button>
                    </div>
                )}

                {status === 'inprogress' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 py-2">
                            <Shield className="text-green-600" size={24} />
                            <div>
                                <h4 className="font-bold text-sm">Ride is monitored</h4>
                                <p className="text-xs text-muted-foreground">Emergency assistance available</p>
                            </div>
                        </div>
                        <button onClick={handleArrivedDest} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90">
                            🚧 Demo: Reach Destination
                        </button>
                    </div>
                )}

                {status === 'payment' && (
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold">₹{ride?.farePerSeat || 120}</h2>
                        <p className="text-muted-foreground">Ride Completed</p>

                        <button onClick={handlePay} className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90">
                            Pay Now
                        </button>
                    </div>
                )}

                {status === 'completed' && (
                    <div className="text-center py-8">
                        <h3 className="text-xl font-bold">Thank you for riding!</h3>
                    </div>
                )}

            </div>
        </motion.div>
    );
}
