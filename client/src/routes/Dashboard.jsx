import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Recent Activity</h3>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    User / Driver
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {stats.activity && stats.activity.length > 0 ? (
                  stats.activity.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        {item.action}
                      </td>
                      <td className="p-4 align-middle">Om Thanage</td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                            ${item.status === "completed" ||
                              item.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : item.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(item.time).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-right">
                        {item.type === "trip" ? (
                          <Link
                            to={`/trips/${item.id}`}
                            className="text-primary hover:underline underline-offset-4"
                          >
                            View Trip
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
