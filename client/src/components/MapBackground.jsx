import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

const libraries = ['places'];

export default function MapBackground({ userLocation, destination, directions, rides = [] }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
        libraries,
    });

    const mapRef = useRef(null);

    const onLoad = useCallback(function callback(map) {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(function callback(map) {
        mapRef.current = null;
    }, []);

    // Update center when userLocation changes and no route is active
    useEffect(() => {
        if (mapRef.current && userLocation && !directions) {
            mapRef.current.panTo(userLocation);
            mapRef.current.setZoom(15);
        }
    }, [userLocation, directions]);

    if (!isLoaded) return <div className="absolute inset-0 bg-gray-100 animate-pulse z-0" />;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || { lat: 20.5937, lng: 78.9629 }}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                    }}
                />
            )}

            {/* Route Renderer */}
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        polylineOptions: {
                            strokeColor: "#000000",
                            strokeWeight: 4,
                        },
                        suppressMarkers: false, // We can customize this if needed
                    }}
                />
            )}
            {/* Nearby Rides Markers */}
            {rides.map(ride => (
                ride.startLocation?.coordinates && (
                    <Marker
                        key={ride._id}
                        position={{ lat: ride.startLocation.coordinates[1], lng: ride.startLocation.coordinates[0] }}
                        icon={{
                            path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
                            fillColor: "black",
                            fillOpacity: 1,
                            strokeWeight: 0,
                            rotation: 0,
                            scale: 1,
                            anchor: new window.google.maps.Point(12, 12),
                        }}
                    />
                )
            ))}
        </GoogleMap>
    );
}
