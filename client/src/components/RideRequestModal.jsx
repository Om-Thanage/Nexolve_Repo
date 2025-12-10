import React, { useState } from "react";
import api from "../api";

export default function RideRequestModal({ tripId, onClose }) {
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/requests", {
        tripId,
        userId: localStorage.getItem("userId") || "6753176d0f81d89843640274",
        seatsRequested: seats,
      });
      alert("Request sent successfully!");
      onClose();
    } catch (e) {
      alert("Error sending request. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-lg p-6 w-full max-w-md mx-4 sm:mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Request to join
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter the number of seats you need.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Seats</label>
            <input
              type="number"
              value={seats}
              min={1}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              onClick={onClose}
              className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
