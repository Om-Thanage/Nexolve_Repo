import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function DriverRegister() {
  const [license, setLicense] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please login first.");
        return;
      }
      // Create vehicle first (skipped: require API endpoint)
      const payload = {
        userId,
        licenseDetails: { number: license, expiryDate: expiry },
        vehicleId: null,
      };
      await api.post("/drivers/register", payload);
      alert("Driver application submitted");
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Error: Only one driver profile allowed or backend issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Become a Driver</h2>
          <p className="text-sm text-muted-foreground">
            Register your vehicle and license to start earning.
          </p>
        </div>

        <div className="p-6 pt-0">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  License Number
                </label>
                <input
                  required
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="e.g. DL-123456789"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  License Expiry
                </label>
                <input
                  required
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
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
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
