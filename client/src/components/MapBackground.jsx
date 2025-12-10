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

export default function MapBackground({ userLocation, destination, directions }) {
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
        </GoogleMap>
    );
}
