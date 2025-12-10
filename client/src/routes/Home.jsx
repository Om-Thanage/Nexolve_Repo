import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import MapBackground from "../components/MapBackground";
import HomeSearch from "../components/HomeSearch";
import RideOptionsList from "../components/RideOptionsList";
import CarpoolDetails from "../components/CarpoolDetails";
import RideStatusPanel from "../components/RideStatusPanel";
import DriverRequestModal from "../components/DriverRequestModal";
import { useJsApiLoader } from "@react-google-maps/api";
import { useUser } from "@clerk/clerk-react";

const libraries = ['places'];

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null); // stores { address, coordinates }
  const [startAddress, setStartAddress] = useState("Current Location");
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [rides, setRides] = useState([]);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [viewState, setViewState] = useState('searching'); // 'searching', 'details', 'ride'
  const [isSearching, setIsSearching] = useState(false);

  // Real User & Driver Logic
  const { user } = useUser();
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [dbUser, setDbUser] = useState(null); // Assuming we fetch our DB user details separately if needed.

  // Poll for Incoming Requests (Driver Mode)
  useEffect(() => {
    let interval;
    if (user) {
      // Fetch MongoDB ID? For now we can use Clerk ID or just rely on backend to resolve user from auth token if implemented
      // But our backend 'getPendingRequests' expects 'userId' (Mongo ID) currently.
      // We need to resolve Clerk ID to Mongo ID first.
      // Quick Fix: Let's assume we can pass clerkId to backend or we fetch userId once.
      const checkRequests = async () => {
        try {
          // First get our Mongo ID if not known (optimize later)
          // For hackathon, we assume api.get('/users/me') or similar exists or we search by clerkId first
          // Let's try to find user by clerkId if we don't have dbUser
          let userId = dbUser?._id;

          if (!userId) {
            const uRes = await api.get(`/users/${user.id}`); // This endpoint needs to exist or be /users?clerkId=...
            // Wait, our backend might check auth header. 
            // Let's assume we use /users/profile or similar.
            // If standard setup: GET /users/my-profile
            // fallback: we search by email/clerkId
            const userRes = await api.get(`/users/check/${user.id}`).catch(() => null);
            if (userRes && userRes.data) {
              setDbUser(userRes.data);
              userId = userRes.data._id;
            }
          }

          if (userId) {
            const res = await api.get('/ride-requests/pending', { params: { userId } });
            if (res.data && res.data.length > 0) {
              setIncomingRequest(res.data[0]); // Show first one
            }
          }
        } catch (e) {
          console.error("Poll error", e);
        }
      };

      interval = setInterval(checkRequests, 5000); // Check every 5s
      checkRequests();
    }
    return () => clearInterval(interval);
  }, [user, dbUser]);

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
          setStartLocation({
            address: "Current Location",
            coordinates: [position.coords.longitude, position.coords.latitude]
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
            origin: startLocation ? { lat: startLocation.coordinates[1], lng: startLocation.coordinates[0] } : userLocation,
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

              // B. Create Mock Alternatives - REMOVED
              // We rely solely on real carpools now.


            } else {
              console.error(`Directions request failed: ${status}`);
            }
          }
        );

        // C. Fetch Real Carpools (from Backend)
        try {
          // Use search endpoint with start and end coordinates
          const startCoords = startLocation ? startLocation.coordinates : [userLocation.lng, userLocation.lat];
          const destCoords = destination.coordinates || [];

          const params = {
            startLat: startCoords[1],
            startLng: startCoords[0]
          };

          if (destCoords.length === 2) {
            params.endLat = destCoords[1];
            params.endLng = destCoords[0];
          }

          const res = await api.get("/trips/search", { params });
          setRides(res.data || []);
        } catch (e) {
          console.error("Failed to fetch carpools", e);
        } finally {
          setIsSearching(false);
        }
      }

      fetchRouteAndRides();
    }
  }, [isLoaded, userLocation, startLocation, destination]);

  const handleStartLocationSelect = (data) => {
    setStartLocation(data);
    setStartAddress(data.address);
  };

  const handleDestinationSelect = (data) => {
    // data = { address, coordinates: [lng, lat], place }
    setDestination(data);
    setSelectedRideId(null); // Reset selection
    setViewState('searching');
  };

  const handleSelectOption = (option) => {
    setSelectedRideId(option.id || option._id);
    setSelectedRide(option);

    // If it's a real trip (has _id and host), show details
    // If mock, we might skip details or mock them.
    if (option.type === 'car') {
      setViewState('details');
    }
  };

  const handleRequestRide = async () => {
    // 1. Create Request
    if (!selectedRide || !dbUser) return;

    try {
      await api.post('/ride-requests', {
        tripId: selectedRide._id,
        userId: dbUser._id,
        seatsNeeded: 1,
        note: "Looking for a ride!"
      });
      // 2. Switch to 'ride' view (Meeting state)
      setViewState('ride');
    } catch (e) {
      alert("Failed to request ride: " + (e.response?.data?.message || e.message));
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;
    try {
      await api.put(`/ride-requests/${incomingRequest._id}/status`, { status: "accepted" });
      setIncomingRequest(null);
      alert("Ride Accepted! Please proceed to pickup location.");
      // Ideally switch to Driver View here
    } catch (e) {
      console.error(e);
    }
  };

  const handleRideReset = () => {
    setViewState('searching');
    setDestination(null);
    setDirections(null);
    setStartLocation(null);
    setStartAddress("Current Location");
    setRides([]);
  };

  const handleUseCurrentLocation = () => {
    setStartAddress("Current Location");
    if (userLocation) {
      setStartLocation({
        address: "Current Location",
        coordinates: [userLocation.lng, userLocation.lat]
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* 1. Map Background */}
      <MapBackground
        userLocation={userLocation}
        destination={destination}
        directions={directions}
        rides={rides}
      />

      {/* 2. Top Search Bar */}
      <HomeSearch
        startLocationValue={startAddress}
        onStartChange={(e) => setStartAddress(e.target.value)}
        onStartSelect={handleStartLocationSelect}
        onDestinationSelect={handleDestinationSelect}
        onUseCurrentLocation={handleUseCurrentLocation}
      />

      {/* 3. Bottom Sheet Results */}
      {viewState === 'searching' && (rides.length > 0) && destination && (
        <RideOptionsList
          rides={rides}
          alternatives={[]}
          selectedId={selectedRideId}
          onSelect={handleSelectOption}
        />
      )}

      {/* 4. Details View */}
      {viewState === 'details' && selectedRide && (
        <CarpoolDetails
          ride={selectedRide}
          onBack={() => setViewState('searching')}
          onRequest={handleRequestRide}
        />
      )}

      {/* 5. Live Ride Status */}
      {viewState === 'ride' && selectedRide && (
        <RideStatusPanel
          ride={selectedRide}
          onReset={handleRideReset}
        />
      )}

      {/* 6. Driver Modal */}
      <DriverRequestModal
        request={incomingRequest}
        onAccept={handleAcceptRequest}
        onDecline={() => setIncomingRequest(null)}
      />
    </div>
  );
}
