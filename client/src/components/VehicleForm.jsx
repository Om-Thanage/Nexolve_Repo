import React, { useState, useEffect } from 'react';
import api from '../api';

export default function VehicleForm({ driverId, existingVehicle, onClose }) {
    const [formData, setFormData] = useState({
        model: '',
        plateNumber: '',
        capacity: 4,
        fuelType: 'petrol',
        condition: 'good',
        photo: ''
    });

    useEffect(() => {
        if (existingVehicle) {
            setFormData({
                model: existingVehicle.model || '',
                plateNumber: existingVehicle.plateNumber || '',
                capacity: existingVehicle.capacity || 4,
                fuelType: existingVehicle.fuelType || 'petrol',
                condition: existingVehicle.condition || 'good',
                photo: existingVehicle.photo || ''
            });
        }
    }, [existingVehicle]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!driverId) {
                alert("Missing Driver ID. Please reload.");
                return;
            }
            const payload = { ...formData, driver: driverId };

            let res;
            if (existingVehicle) {
                res = await api.put(`/vehicles/${existingVehicle._id}`, payload);
            } else {
                res = await api.post('/vehicles', payload);
            }
            // Pass the vehicle object back to the parent
            onClose(res.data.vehicle || res.data);
        } catch (error) {
            console.error("Error saving vehicle:", error);
            alert("Failed to save vehicle: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold mb-2">{existingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">Model</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2"
                        placeholder="e.g. Toyota Camry"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Plate Number</label>
                    <input
                        type="text"
                        name="plateNumber"
                        value={formData.plateNumber}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Fuel Type</label>
                        <select
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="cng">CNG</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Photo URL</label>
                    <input
                        type="text"
                        name="photo"
                        value={formData.photo}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        placeholder="http://..."
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {existingVehicle ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
