import React, { useEffect, useState } from "react";
import VehicleList from "../components/VehicleList";
import api from "../api";
import { Link } from "react-router-dom";

export default function MyVehicles() {
    const [driverId, setDriverId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDriverProfile = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    setError("Please log in to manage your vehicles.");
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/drivers/user/${userId}`);
                setDriverId(res.data._id);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching driver profile:", err);
                if (err.response && err.response.status === 404) {
                    setError("You are not registered as a driver yet.");
                } else {
                    setError("Failed to load driver profile.");
                }
                setLoading(false);
            }
        };

        fetchDriverProfile();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Vehicle Management</h1>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-yellow-800">
                    <p>{error}</p>
                    {error.includes("not registered") && (
                        <Link to="/driver/register" className="text-blue-600 hover:underline mt-2 block">
                            Register as a Driver
                        </Link>
                    )}
                </div>
            ) : (
                <VehicleList driverId={driverId} />
            )}
        </div>
    );
}
