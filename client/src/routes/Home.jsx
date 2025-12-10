import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import MapBackground from "../components/MapBackground";
import HomeSearch from "../components/HomeSearch";
import RideOptionsList from "../components/RideOptionsList";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ['places'];

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [rides, setRides] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load Google Maps script once here if needed for services, 
  // but individual components use it too. 
  // To ensure services (DirectionsService) work, we need to wait for load.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
    libraries,
  });

  // 1. Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default (e.g., Nagpur or generic)
          setUserLocation({ lat: 21.1458, lng: 79.0882 });
        }
      );
    }
  }, []);

  // 2. Fetch Directions & Rides when destination changes
  useEffect(() => {
    if (isLoaded && userLocation && destination) {
      const fetchRouteAndRides = async () => {
        setIsSearching(true);

        // A. Calculate Route
        const directionsService = new window.google.maps.DirectionsService();

        // Dest coords or address
        const destLocation = destination.coordinates
          ? { lat: destination.coordinates[1], lng: destination.coordinates[0] }
          : destination.address;

        directionsService.route(
          {
            origin: userLocation,
            destination: destLocation,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          async (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);

              // Extract distance/duration for mock pricing
              const route = result.routes[0].legs[0];
              const distanceKm = route.distance.value / 1000;
              // const durationMins = route.duration.value / 60;

              // B. Create Mock Alternatives
              setAlternatives([
                {
                  id: 'uber-go',
                  type: 'car',
                  title: 'Uber Go',
                  price: Math.round(distanceKm * 12 + 50), // Base calc
                  eta: 4,
                  desc: 'Affordable, compact rides'
                },
                {
                  id: 'moto',
                  type: 'bike',
                  title: 'Moto',
                  price: Math.round(distanceKm * 5 + 20),
                  eta: 2,
                  desc: 'Fastest way to beat traffic'
                },
                {
                  id: 'auto',
                  type: 'auto',
                  title: 'Auto',
                  price: Math.round(distanceKm * 10 + 30), // Approx
                  eta: 5,
                  desc: 'No bargaining'
                }
              ]);

            } else {
              console.error(`Directions request failed: ${status}`);
            }
          }
        );

        // C. Fetch Real Carpools (from Backend)
        try {
          // In a real scenario, we pass lat/lng buffer.
          // For now, grabbing all valid trips and we'll trust the backend/user to filter visually or list them.
          // Or we use the search endpoint if implemented.
          // Let's use the 'getAllTrips' endpoint we enabled earlier (GET /trips) 
          // or 'search' if we had strict geofencing. 
          // The search endpoint in previous turns was: /trips/search?startLat...
          // But let's just use /trips which returns upcoming ones, as per our simpler logic.
          const res = await api.get("/trips");
          setRides(res.data || []);
        } catch (e) {
          console.error("Failed to fetch carpools", e);
        } finally {
          setIsSearching(false);
        }
      }

      fetchRouteAndRides();
    }
  }, [isLoaded, userLocation, destination]);

  const handleDestinationSelect = (data) => {
    // data = { address, coordinates: [lng, lat], place }
    setDestination(data);
    setSelectedRideId(null); // Reset selection
  };

  const handleSelectOption = (option) => {
    setSelectedRideId(option.id || option._id);
    // If it's a real trip, we might want to navigate to details or show a 'Request' modal.
    // The UI requirements said "Select", so we just highlight for now. 
    // In a real flow, a "Confirm" button would trigger the action.
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* 1. Map Background */}
      <MapBackground
        userLocation={userLocation}
        destination={destination}
        directions={directions}
      />

      {/* 2. Top Search Bar */}
      <HomeSearch
        onDestinationSelect={handleDestinationSelect}
      />

      {/* 3. Bottom Sheet Results */}
      {(rides.length > 0 || alternatives.length > 0) && destination && (
        <RideOptionsList
          rides={rides}
          alternatives={alternatives}
          selectedId={selectedRideId}
          onSelect={handleSelectOption}
        />
      )}
    </div>
  );
}
