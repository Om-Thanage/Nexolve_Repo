import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.75rem'
};

const libraries = ['places'];

export default function MapDisplay({ startLocation, endLocation }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [directionsResponse, setDirectionsResponse] = useState(null);

    const calculateRoute = useCallback(() => {
        if (!startLocation || !endLocation || !window.google) return;

        // Use coordinates if available, otherwise address
        const origin = startLocation.coordinates && (startLocation.coordinates[0] !== 0 || startLocation.coordinates[1] !== 0)
            ? { lat: startLocation.coordinates[1], lng: startLocation.coordinates[0] }
            : startLocation.address;

        const destination = endLocation.coordinates && (endLocation.coordinates[0] !== 0 || endLocation.coordinates[1] !== 0)
            ? { lat: endLocation.coordinates[1], lng: endLocation.coordinates[0] }
            : endLocation.address;

        if (!origin || !destination) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResponse(result);
                } else {
                    console.error(`Directions request failed: ${status}`);
                }
            }
        );
    }, [startLocation, endLocation]);

    useEffect(() => {
        if (isLoaded) {
            calculateRoute();
        }
    }, [isLoaded, calculateRoute]);

    if (!isLoaded) return <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />;

    // Default center (e.g., India or US) if no route
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={5}
            options={{ disableDefaultUI: true, zoomControl: true }}
        >
            {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
            )}

            {!directionsResponse && startLocation?.coordinates && (
                <Marker position={{ lat: startLocation.coordinates[1], lng: startLocation.coordinates[0] }} />
            )}
        </GoogleMap>
    );
}
