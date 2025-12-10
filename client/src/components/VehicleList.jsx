import React, { useState, useEffect } from 'react';
import api from '../api';
import VehicleForm from './VehicleForm';

// Assuming we have a way to get the current driver ID.
// For now, we might need to pass it as a prop or get from context/local storage.
// Since auth is a bit loose, we'll try to get it from localStorage if saved during login/register.

export default function VehicleList({ driverId }) {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    useEffect(() => {
        if (driverId) {
            fetchVehicles();
        }
    }, [driverId]);

    const fetchVehicles = async () => {
        try {
            const res = await api.get(`/vehicles?driverId=${driverId}`);
            setVehicles(res.data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (error) {
                console.error("Error deleting vehicle:", error);
            }
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingVehicle(null);
        fetchVehicles();
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Vehicles</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Vehicle
                </button>
            </div>

            {showForm && (
                <div className="mb-4">
                    <VehicleForm
                        driverId={driverId}
                        existingVehicle={editingVehicle}
                        onClose={handleFormClose}
                    />
                </div>
            )}

            <div className="grid gap-4">
                {vehicles.length === 0 ? (
                    <p>No vehicles found.</p>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle._id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{vehicle.model} - {vehicle.plateNumber}</h3>
                                <p className="text-sm text-gray-600">{vehicle.color} • {vehicle.capacity} seats</p>
                                <p className="text-sm text-gray-500">Fuel: {vehicle.fuelType}</p>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => handleEdit(vehicle)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(vehicle._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
