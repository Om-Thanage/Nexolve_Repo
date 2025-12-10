import { Link } from "react-router-dom";

export default function TripCard({ trip }) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold tracking-tight text-lg">
            {trip.host?.user?.name || "Driver"}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-foreground">
              {trip.startLocation?.address || "Origin"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-foreground">
              {trip.endLocation?.address || "Destination"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(trip.startTime).toLocaleString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 w-full md:w-auto justify-between md:justify-center">
          <div className="text-right">
            <div className="text-2xl font-bold">₹{trip.farePerSeat}</div>
            <div className="text-xs text-muted-foreground">
              {trip.availableSeats} seats left
            </div>
          </div>

          <Link
            to={`/trips/${trip._id}`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full md:w-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
