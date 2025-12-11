import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Shield,
  CheckCircle2,
  Navigation as NavIcon,
  Car,
} from "lucide-react";
import api from "../api";

export default function RideStatusPanel({
  ride,
  request,
  isDriver,
  onReset,
  onDriverArrived,
}) {
  // Shared Status Panel for Rider & Driver
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverArrived, setDriverArrived] = useState(false);
  const [driverOtp, setDriverOtp] = useState("");

  useEffect(() => {
    if (request?.paymentStatus === "paid") {
      setPaymentDone(true);
    }
  }, [request]);

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 4) return alert("Enter 4 digits");
    setLoading(true);
    try {
      // Verify via update status
      // Assuming 'api' is globally available or imported elsewhere
      await api.put(`/requests/${request._id}/status`, {
        status: "ongoing",
        otp: otpInput,
      });
      // Status update will be reflected via props/poll
    } catch (e) {
      alert(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEndRide = async () => {
    try {
      // Assuming 'api' is globally available or imported elsewhere
      await api.put(`/requests/${request._id}/status`, { status: "completed" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleArrived = async () => {
    setLoading(true);
    try {
      await api.put(`/requests/${request._id}/status`, { status: "arrived" });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
    const handleArrived = async () => {
        setLoading(true);
        try {
            await api.put(`/requests/${request._id}/status`, { status: "arrived" });
        } catch (e) { console.error(e) }
        setLoading(false);
    };

    const handleCancelRide = async () => {
        if (!window.confirm("Are you sure you want to cancel the ride?")) return;
        setLoading(true);
        try {
            await api.put(`/requests/${request._id}/status`, { status: "cancelled" });
            // The Home component polling will pick this up and clear the view, or we can call onReset
            onReset();
        } catch (e) {
            console.error(e);
            alert("Failed to cancel ride");
        }
        setLoading(false);
    };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User session not found. Please log in again.");
        return;
      }

      // Note: tripId is typically available in the 'ride' object
      const res = await api.post("/payments/split", {
        tripId: ride._id,
        userIds: [userId],
        totalAmount: ride.farePerSeat,
      });

      if (res.data.payments && res.data.payments.length > 0) {
        // Redirect user to the Razorpay Payment Link (short_url)
        const paymentUrl = res.data.payments[0].transactionId;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          alert("Payment link generation failed.");
        }
      } else {
        alert("Failed to initiate payment.");
      }
    } catch (e) {
      console.error("Payment Error:", e);
      alert("Error initiating payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentDone) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-background rounded-t-3xl shadow-2xl p-6 text-center"
      >
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {isDriver ? "Trip Completed!" : "Thank you for riding!"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {isDriver
            ? "Payment has been received."
            : "Your payment was successful."}
        </p>
        <button
          onClick={async () => {
            // Archive the request so it doesn't show up again
            try {
              await api.put(`/requests/${request._id}/archive`);
            } catch (e) {
              console.error("Failed to archive request", e);
            }
            onReset();
          }}
          className="w-full py-3 bg-secondary font-bold rounded-xl hover:bg-secondary/80"
        >
          Close
        </button>
      </motion.div>
    );
  }

  // Dynamic Headers based on Role
  let title = "";
  let subtitle = "";

  if (request.status === "accepted") {
    title = isDriver ? "Pick up Rider" : "Driver is arriving";
    subtitle = isDriver ? "Head to pickup location" : "Share OTP with driver";
  } else if (request.status === "arrived") {
    title = isDriver ? "Verify Rider" : "Driver has Arrived!";
    subtitle = isDriver ? "Enter OTP from rider" : "Meet your driver";
  } else if (request.status === "ongoing") {
    title = isDriver ? "Drop-off Rider" : "Heading to destination";
    subtitle = isDriver ? "Navigate to destination" : "Enjoy your ride";
  } else if (request.status === "completed") {
    title = "Ride Completed";
    subtitle = "Payment due";
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] border-t border-border md:w-96 md:left-auto md:right-8 md:bottom-8 md:rounded-3xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <NavIcon size={20} className="text-white" />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* STATUS: ACCEPTED */}
        {request.status === "accepted" && (
          <div className="space-y-4">
            {isDriver ? (
              <>
                <button
                  onClick={handleArrived}
                  disabled={loading}
                  className="w-full py-3 bg-foreground text-background font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "I have Arrived"}
                </button>
                <button
                  onClick={onDriverArrived}
                  className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200"
                >
                  ⚡ Teleport to Pickup
                </button>
              </>
            ) : (
              // Rider View (Waiting)
              <div className="bg-secondary/30 p-4 rounded-xl text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Driver is on the way
                </p>
                <div className="text-2xl font-bold text-primary">
                  {ride.vehicle?.model} • {ride.vehicle?.plateNumber || "...."}
                </div>
              </div>
            )}
          </div>
        )}
            <div className="p-5 space-y-6">

                {/* STATUS: ACCEPTED */}
                {request.status === 'accepted' && (
                    <div className="space-y-4">
                        {isDriver ? (
                            <>
                                <button
                                    onClick={handleArrived}
                                    disabled={loading}
                                    className="w-full py-3 bg-foreground text-background font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'I have Arrived'}
                                </button>
                                <button
                                    onClick={onDriverArrived}
                                    className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200"
                                >
                                    ⚡ Teleport to Pickup
                                </button>
                            </>
                        ) : (
                            // Rider View (Waiting)
                            <div className="bg-secondary/30 p-4 rounded-xl text-center space-y-2">
                                <p className="text-sm text-muted-foreground">Driver is on the way</p>
                                <div className="text-2xl font-bold text-primary">
                                    {ride.vehicle?.model} • {ride.vehicle?.plateNumber || '....'}
                                </div>
                                <button
                                    onClick={handleCancelRide}
                                    disabled={loading}
                                    className="w-full py-2 text-destructive font-medium hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    Cancel Ride
                                </button>
                            </div>
                        )}
                    </div>
                )}

        {/* STATUS: ARRIVED */}
        {request.status === "arrived" && (
          <div className="space-y-4">
            {isDriver ? (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  Ask rider for OTP
                </p>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center text-4xl font-mono tracking-widest border border-border rounded-xl py-4 bg-secondary/20 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0000"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpInput.length < 4}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            ) : (
              // Rider View (Arrived - Show OTP)
              <>
                <div className="bg-secondary/30 p-4 rounded-xl text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Share this OTP with {ride.host?.user?.name || "Driver"}
                  </p>
                  <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary text-center pl-2">
                    {request.otp || "...."}
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  <Shield size={16} className="mt-0.5" />
                  <p>Driver is here! Give this code to start ride.</p>
                </div>
              </>
            )}
          </div>
        )}
                {/* STATUS: ARRIVED */}
                {request.status === 'arrived' && (
                    <div className="space-y-4">
                        {isDriver ? (
                            <>
                                <p className="text-center text-sm text-muted-foreground">Ask rider for OTP</p>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    className="w-full text-center text-4xl font-mono tracking-widest border border-border rounded-xl py-4 bg-secondary/20 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="0000"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={loading || otpInput.length < 4}
                                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </>
                        ) : (
                            // Rider View (Arrived - Show OTP)
                            <>
                                <div className="bg-secondary/30 p-4 rounded-xl text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">Share this OTP with {ride.host?.user?.name || 'Driver'}</p>
                                    <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary text-center pl-2">
                                        {request.otp || '....'}
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-start gap-2">
                                    <Shield size={16} className="mt-0.5" />
                                    <p>Driver is here! Give this code to start ride.</p>
                                </div>
                                <button
                                    onClick={handleCancelRide}
                                    disabled={loading}
                                    className="w-full py-2 text-destructive font-medium hover:bg-destructive/10 rounded-lg transition-colors text-sm"
                                >
                                    Cancel Ride
                                </button>
                            </>
                        )}
                    </div>
                )}

        {/* STATUS: ONGOING */}
        {request.status === "ongoing" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Car size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">On the way</h4>
                <p className="text-xs text-muted-foreground">
                  {isDriver
                    ? "Drive carefully"
                    : "You are in " + (ride.vehicle?.model || "car")}
                </p>
              </div>
            </div>
            {isDriver && (
              <button
                onClick={handleEndRide}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700"
              >
                End Ride
              </button>
            )}
          </div>
        )}

        {/* STATUS: COMPLETED / PAYMENT */}
        {request.status === "completed" && (
          <div className="space-y-4 text-center">
            <div className="py-4">
              <h2 className="text-3xl font-bold">₹{ride?.farePerSeat || 0}</h2>
              <p className="text-muted-foreground">Total Fare</p>
            </div>
            {!isDriver && (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 shadow-lg disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            )}
            {isDriver && (
              <div className="bg-green-100 text-green-800 p-3 rounded">
                Payment Pending from User
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
