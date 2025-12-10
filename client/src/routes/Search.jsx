import React, { useState } from "react";
import api from "../api";
import TripCard from "../components/TripCard";

export default function Search() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      // Fetch all trips and filter client-side since backend search requires exact lat/lng
      const res = await api.get("/trips");
      const allTrips = res.data;

      const filtered = allTrips.filter((t) => {
        const matchStart =
          !start ||
          (t.startLocation?.address || "")
            .toLowerCase()
            .includes(start.toLowerCase());
        const matchEnd =
          !end ||
          (t.endLocation?.address || "")
            .toLowerCase()
            .includes(end.toLowerCase());
        return matchStart && matchEnd;
      });

      setResults(filtered);
    } catch (e) {
      console.error(e);
      // alert("Search error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Find a Ride</h1>
        <p className="text-muted-foreground">
          Enter your route details to find available carpools.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form
          onSubmit={doSearch}
          className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end"
        >
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              From
            </label>
            <input
              placeholder="e.g. Downtown"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              To
            </label>
            <input
              placeholder="e.g. Airport"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {searched && results.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
            <p>No trips found matching your criteria.</p>
            <button
              onClick={() => {
                setStart("");
                setEnd("");
                setSearched(false);
              }}
              className="text-primary hover:underline mt-2 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {results.map((trip, i) => (
            <TripCard key={trip._id || i} trip={trip} />
          ))}
        </div>
      </div>
    </div>
  );
}
