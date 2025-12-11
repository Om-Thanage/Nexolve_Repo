import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Shield,
  CheckCircle2,
  Navigation as NavIcon,
  Car,
  Users,
  X,
} from "lucide-react";
import api from "../api";
import ChatPanel from "./ChatPanel";

export default function DriverActiveRidePanel({
  trip,
  requests,
  onReset,
  onDriverArrived,
}) {
  const [loading, setLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState({}); // { requestId: '1234' }
  const [expandedRequest, setExpandedRequest] = useState(null); // ID of currently expanded user card
  const [activeChatUser, setActiveChatUser] = useState(null); // { id, name }

  // Helper to get OTP input for a specific request
  const getOtpArgs = (reqId) => otpInputs[reqId] || "";

  // Helper to set OTP input
  const setOtpArgs = (reqId, val) => {
    setOtpInputs((prev) => ({ ...prev, [reqId]: val }));
  };

  const handleVerifyOtp = async (request) => {
    const input = getOtpArgs(request._id);
    if (input.length !== 4) return alert("Enter 4 digits");

    setLoading(true);
    try {
      await api.put(`/requests/${request._id}/status`, {
        status: "ongoing",
        otp: input,
      });
      // Clear input on success
      setOtpArgs(request._id, "");
    } catch (e) {
      alert(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleArrivedForUser = async (requestId) => {
    setLoading(true);
    try {
      await api.put(`/requests/${requestId}/status`, { status: "arrived" });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCancelUser = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this passenger?"))
      return;
    setLoading(true);
    try {
      await api.put(`/requests/${requestId}/status`, { status: "cancelled" });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEndRideForUser = async (requestId) => {
    if (!window.confirm("End ride for this passenger?")) return;
    setLoading(true);
    try {
      await api.put(`/requests/${requestId}/status`, { status: "payment-pending" });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEndAllRides = async () => {
    if (!window.confirm("End ride for ALL passengers?")) return;
    setLoading(true);
    try {
      const active = requests.filter((r) => r.status === "ongoing");
      await Promise.all(
        active.map((r) =>
          api.put(`/requests/${r._id}/status`, { status: "payment-pending" })
        )
      );
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Filter out completed/cancelled for the main list, OR keep them?
  // Usually driver wants to see active people.
  // Let's show: accepted, arrived, ongoing. Completed can be history or a separate tab.
  // implementation_plan says: "List all passengers with their current status"
  const activeRequests = requests.filter((r) =>
    ["accepted", "arrived", "ongoing", "payment-pending"].includes(r.status)
  );
  const completedRequests = requests.filter((r) => r.status === "completed");

  // Calculate generic status for header
  const hasOngoing = activeRequests.some((r) => r.status === "ongoing");
  const allArrived =
    activeRequests.length > 0 &&
    activeRequests.every((r) => ["arrived", "ongoing"].includes(r.status));

  let title = "Picking up Passengers";
  let subtitle = "Head to pickup locations";

  if (hasOngoing) {
    title = "Ride in Progress";
    subtitle = "Drive carefully to destinations";
  } else if (allArrived) {
    title = "Waiting for OTPs";
    subtitle = "Verify all passengers";
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      className={`absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] border-t border-border md:left-auto md:right-8 md:bottom-8 md:rounded-3xl flex flex-col overflow-hidden max-h-[80vh] transition-all duration-300 ${activeChatUser ? "h-[600px] md:w-[28rem]" : "md:w-[28rem]"
        }`}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDriverArrived}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors tooltip"
            title="Teleport to Pickup"
          >
            <NavIcon size={20} className="text-white" />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Car size={20} className="text-white" />
          </div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-4">
        {/* Chat Panel Overlay */}
        <ChatPanel
          isOpen={!!activeChatUser}
          onClose={() => setActiveChatUser(null)}
          receiverId={activeChatUser?.id}
          receiverName={activeChatUser?.name}
        />

        {/* Active Passengers List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Passengers ({activeRequests.length})
            </h4>
            {hasOngoing && (
              <button
                onClick={handleEndAllRides}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                End All
              </button>
            )}
          </div>

          {activeRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Waiting for passengers to join...
            </div>
          )}

          <AnimatePresence>
            {activeRequests.map((req) => (
              <motion.div
                key={req._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                        {req.user?.name?.[0] || <Users size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {req.user?.name || "Passenger"}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize status-badge">
                          {req.status}
                        </div>
                      </div>
                    </div>

                    {/* Actions based on Status (Inline for non-arrived) */}
                    <div className="flex items-center gap-2">
                      {/* Chat Button */}
                      <button
                        onClick={() =>
                          setActiveChatUser({
                            id: req.user?._id,
                            name: req.user?.name,
                          })
                        }
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                      >
                        <MessageSquare size={18} />
                      </button>

                      {req.status === "accepted" && (
                        <>
                          <button
                            onClick={() => handleCancelUser(req._id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => handleArrivedForUser(req._id)}
                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90"
                          >
                            Arrived
                          </button>
                        </>
                      )}

                      {req.status === "ongoing" && (
                        <button
                          onClick={() => handleEndRideForUser(req._id)}
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 border border-border"
                        >
                          Drop
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded OTP Section for Arrived Status */}
                  {req.status === "arrived" && (
                    <div className="mt-3 space-y-3 p-2 bg-secondary/10 rounded-lg">
                      <p className="text-center text-sm text-muted-foreground">
                        Ask rider for OTP
                      </p>
                      <input
                        type="text"
                        maxLength={4}
                        value={getOtpArgs(req._id)}
                        onChange={(e) => setOtpArgs(req._id, e.target.value)}
                        className="w-full text-center text-3xl font-mono tracking-widest border border-border rounded-xl py-3 bg-secondary/20 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0000"
                      />
                      <button
                        onClick={() => handleVerifyOtp(req)}
                        disabled={getOtpArgs(req._id).length < 4 || loading}
                        className="w-full py-2 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          "Verifying..."
                        ) : (
                          <>
                            {" "}
                            <CheckCircle2 size={18} /> Verify OTP{" "}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Completed Section (Optional, collapsed by default logic could be added) */}
        {completedRequests.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-2">
              Dropped Off ({completedRequests.length})
            </h4>
            <div className="space-y-2 opacity-60">
              {completedRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between text-sm p-2 bg-secondary/20 rounded-lg"
                >
                  <span>{req.user?.name}</span>
                  <span className="text-green-600 text-xs font-bold">Done</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close/Reset Button when all done */}
        {activeRequests.length === 0 && completedRequests.length > 0 && (
          <button
            onClick={async () => {
              if (trip?._id) {
                setLoading(true);
                try {
                  await api.put(`/trips/${trip._id}/status`, {
                    status: "completed",
                  });
                } catch (e) {
                  console.error("Failed to finish trip", e);
                  alert(
                    "Failed to finish trip: " +
                    (e.response?.data?.message || e.message)
                  );
                  setLoading(false);
                  return; // Don't reset if failed
                }
                setLoading(false);
              }
              onReset();
            }}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? "Finishing..." : "Close & Finish Trip"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
