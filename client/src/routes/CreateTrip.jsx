import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import LocationSearchInput from "../components/LocationSearchInput";
import VehicleForm from "../components/VehicleForm";

export default function CreateTrip() {
  const [startLoc, setStartLoc] = useState({ address: "", coordinates: [0, 0] });
  const [endLoc, setEndLoc] = useState({ address: "", coordinates: [0, 0] });
  const [startTime, setStartTime] = useState("");
  const [fare, setFare] = useState(50);
  const [seats, setSeats] = useState(3);
  const [vehicleId, setVehicleId] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [isDriver, setIsDriver] = useState(null); // null=loading, true=yes, false=no
  const navigate = useNavigate();

  useEffect(() => {
    checkDriverStatus();
  }, []);

  const checkDriverStatus = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsDriver(false);
        return;
      }

      const res = await api.get(`/drivers/user/${userId}`);
      setDriverId(res.data._id);
      setIsDriver(true);
      // Fetch vehicles immediately with the ID
      fetchVehicles(res.data._id);
    } catch (error) {
      console.error("Driver check error:", error);
      setIsDriver(false);
    }
  };

  const fetchVehicles = async (id) => {
    try {
      const res = await api.get(`/vehicles?driverId=${id}`);
      setVehicles(res.data);
      if (res.data.length > 0 && !vehicleId) {
        setVehicleId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleVehicleAdded = (newVehicle) => {
    setShowVehicleForm(false);
    // Refresh list or optimistically add
    if (newVehicle) {
      setVehicles(prev => [...prev, newVehicle]);
      setVehicleId(newVehicle._id);
    } else {
      fetchVehicles(driverId);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isDriver || !driverId) {
        alert("You must be a registered driver to offer a trip.");
        return;
      }
      if (!vehicleId) {
        alert("Please select a vehicle.");
        return;
      }

      const payload = {
        hostId: driverId,
        startLocation: startLoc,
        endLocation: endLoc,
        startTime,
        farePerSeat: fare,
        availableSeats: seats,
        vehicle: vehicleId
      };

      const res = await api.post("/trips", payload);
      navigate(`/trips/${res.data.trip._id}`);
    } catch (e) {
      console.error(e);
      alert("Error creating trip. Ensure all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  if (isDriver === false) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          <h2 className="text-xl font-bold mb-2">Driver Registration Required</h2>
          <p className="mb-4">You need to register as a driver before you can offer trips or add vehicles.</p>
          <Link to="/driver/register" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 inline-block">
            Register as a Driver
          </Link>
        </div>
      </div>
    );
  }

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
                <LocationSearchInput
                  required
                  value={startLoc.address}
                  onChange={(e) => setStartLoc({ ...startLoc, address: e.target.value })}
                  onSelect={(data) => setStartLoc({ address: data.address, coordinates: data.coordinates })}
                  placeholder="e.g. 123 Main St"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  To Address
                </label>
                <LocationSearchInput
                  required
                  value={endLoc.address}
                  onChange={(e) => setEndLoc({ ...endLoc, address: e.target.value })}
                  onSelect={(data) => setEndLoc({ address: data.address, coordinates: data.coordinates })}
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

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none block mb-2">
                Select Vehicle
              </label>

              {/* Only show vehicle selection if driver is verified (which is handled by main render, but safe to keep check) */}
              {vehicles.length > 0 ? (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.model} ({v.plateNumber}) - {v.fuelType}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-yellow-600 mb-2">
                  <p>No vehicles found. You need to add a vehicle to offer a ride.</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowVehicleForm(!showVehicleForm)}
                className="text-sm text-primary hover:underline mt-2"
              >
                {showVehicleForm ? "Cancel Adding Vehicle" : "+ Add New Vehicle"}
              </button>

              {showVehicleForm && (
                <div className="mt-4 border p-4 rounded bg-accent/10">
                  <VehicleForm
                    driverId={driverId}
                    onClose={handleVehicleAdded}
                  />
                </div>
              )}
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
