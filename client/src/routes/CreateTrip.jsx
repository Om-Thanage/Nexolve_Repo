import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const [startAddr, setStartAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [fare, setFare] = useState(50);
  const [seats, setSeats] = useState(3);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In production you'd geocode addresses into coords before sending
      // Mock hostId if not in localStorage for demo purposes, or handle error
      const hostId =
        localStorage.getItem("driverId") || "6753176d0f81d89843640274"; // Fallback to a mock ID or handle auth check

      const payload = {
        hostId,
        startLocation: { address: startAddr, coordinates: [0, 0] },
        endLocation: { address: endAddr, coordinates: [0, 0] },
        startTime,
        farePerSeat: fare,
        availableSeats: seats,
      };

      const res = await api.post("/trips", payload);
      // alert("Trip created");
      navigate(`/trips/${res.data.trip._id}`);
    } catch (e) {
      console.error(e);
      alert("Error creating trip. Ensure you are a registered driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Offer a Trip</h2>
          <p className="text-sm text-muted-foreground">
            Share your journey and earn money.
          </p>
        </div>

        <div className="p-6 pt-0">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  From Address
                </label>
                <input
                  required
                  value={startAddr}
                  onChange={(e) => setStartAddr(e.target.value)}
                  placeholder="e.g. 123 Main St"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  To Address
                </label>
                <input
                  required
                  value={endAddr}
                  onChange={(e) => setEndAddr(e.target.value)}
                  placeholder="e.g. 456 Corporate Blvd"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Start Time
              </label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Fare per Seat (₹)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Available Seats
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="8"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {loading ? "Creating Trip..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
