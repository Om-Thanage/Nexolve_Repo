import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!stats)
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of platform activity and impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Total Users
            </h3>
            <span className="text-2xl text-primary">👥</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Total Trips
            </h3>
            <span className="text-2xl text-primary">🚗</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalTrips}</div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              CO2 Saved (kg)
            </h3>
            <span className="text-2xl text-primary">🌿</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalCarbonSaved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Estimates based on trip distance
          </p>
        </div>
      </div>
    </div>
  );
}
