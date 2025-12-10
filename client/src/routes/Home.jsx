import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import TripCard from "../components/TripCard";

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips")
      .then((res) => setTrips(res.data.slice(0, 3))) // Show only recent 3
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Find your perfect <span className="text-primary">Carpool</span>{" "}
            match
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Search daily commutes, join recurring rides, and save the planet
            while saving money.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/search"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Search Trips
            </Link>
            <Link
              to="/create-trip"
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              Offer a ride <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-xl">🌱</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Eco-friendly</h3>
          <p className="text-muted-foreground text-sm">
            Reduce your carbon footprint by sharing rides with others.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-xl">💰</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Save Cost</h3>
          <p className="text-muted-foreground text-sm">
            Split fuel costs and save money on your daily commute.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
          <p className="text-muted-foreground text-sm">
            Verified drivers and passengers for a safe journey.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Recent Trips Nearby
            </h2>
            <Link
              to="/search"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading trips...
            </div>
          ) : trips.length > 0 ? (
            <div className="grid gap-4">
              {trips.map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              No recent trips found. Be the first to offer one!
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-sidebar text-sidebar-foreground shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-2">Offer a ride</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Going somewhere? Share your ride and earn money while helping
              others.
            </p>
            <Link
              to="/create-trip"
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2"
            >
              Create Trip
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
