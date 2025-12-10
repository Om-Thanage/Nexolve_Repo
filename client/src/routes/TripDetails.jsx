import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import RideRequestModal from "../components/RideRequestModal";
import MapDisplay from "../components/MapDisplay";

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [showReq, setShowReq] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        setTrip(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!trip)
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Loading details...
      </div>
    );

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between md:items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Trip Details
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {trip.startLocation.address}{" "}
                <span className="text-muted-foreground">→</span>{" "}
                {trip.endLocation.address}
              </h1>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 p-2 bg-secondary/10 rounded-md text-secondary-foreground">
                  <span className="font-semibold">
                    📅 {new Date(trip.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-secondary/10 rounded-md text-secondary-foreground">
                  <span className="font-semibold">
                    ⏰{" "}
                    {new Date(trip.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="text-3xl font-bold text-primary">
                ₹{trip.farePerSeat}
              </div>
              <div className="text-muted-foreground text-sm">per seat</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <MapDisplay
            startLocation={trip.startLocation}
            endLocation={trip.endLocation}
          />
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Route Info</h3>
            <div className="space-y-4">
              <div className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <div className="font-medium">Start</div>
                <div className="text-muted-foreground">
                  {trip.startLocation.address}
                </div>
              </div>
              <div className="relative pl-6 border-l-2 border-border">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-destructive border-4 border-background" />
                <div className="font-medium">End</div>
                <div className="text-muted-foreground">
                  {trip.endLocation.address}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Participants</h3>
            {trip.participants && trip.participants.length > 0 ? (
              <ul className="space-y-2">
                {trip.participants.map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                      {p.name?.[0] || "U"}
                    </div>
                    <span>{p.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No passengers yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                {trip.host?.user?.name?.[0] || "D"}
              </div>
              <div>
                <div className="font-semibold">
                  {trip.host?.user?.name || "Driver"}
                </div>
                <div className="text-xs text-muted-foreground">Host</div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  Available Seats
                </span>
                <span className="font-medium">{trip.availableSeats}</span>
              </div>
              <button
                onClick={() => setShowReq(true)}
                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Request to Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReq && (
        <RideRequestModal tripId={trip._id} onClose={() => setShowReq(false)} />
      )}
    </div>
  );
}
