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
  const [startLocation, setStartLocation] = useState(null);
  const [startAddress, setStartAddress] = useState("Current Location");
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [rides, setRides] = useState([]);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [viewState, setViewState] = useState('searching');
  const [isSearching, setIsSearching] = useState(false);

  const { user } = useUser();
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeDriverRequest, setActiveDriverRequest] = useState(null);
  const [activeRiderRequest, setActiveRiderRequest] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    let interval;
    if (user) {
      const checkRequests = async () => {
        try {
          let userId = dbUser?._id;

          if (!userId) {
            const uRes = await api.get(`/users/${user.id}`);
            if (uRes && uRes.data) {
              setDbUser(uRes.data);
              userId = uRes.data._id;
            }
          }

          if (userId) {
            const res = await api.get('/requests/pending', { params: { userId } });

            // 1. Incoming Requests (Driver)
            if (res.data.incoming && res.data.incoming.length > 0) {
              // Filter for 'requested' status for the modal
              const requested = res.data.incoming.find(r => r.status === 'requested');
              if (requested) setIncomingRequest(requested);

              // Check for active driver tasks (accepted/ongoing)
              const active = res.data.incoming.find(r => ['accepted', 'arrived', 'ongoing'].includes(r.status));
              if (active) {
                setActiveDriverRequest(active);
                // Check viewState to avoid forcing view if user navigated away, but for hackathon auto-switch is good
                if (viewState !== 'driver-active') setViewState('driver-active');
              } else {
                setActiveDriverRequest(null); // Clear if no active driver request
                if (viewState === 'driver-active') setViewState('searching'); // Go back to searching if active driver request is gone
              }
            } else {
              setIncomingRequest(null);
              setActiveDriverRequest(null);
              if (viewState === 'driver-active') setViewState('searching');
            }

            // 2. Outgoing Requests (Rider)
            if (res.data.outgoing && res.data.outgoing.length > 0) {
              // Check for my active requests
              const myActive = res.data.outgoing.find(r => ['accepted', 'arrived', 'ongoing', 'completed'].includes(r.status));
              // Also check 'requested' to show waiting state if selected
              const myRequested = res.data.outgoing.find(r => r.status === 'requested');

              if (myActive) {
                setActiveRiderRequest(myActive);
                // If I have an active ride, show panel
                if (viewState !== 'ride') setViewState('ride');
              } else if (myRequested) {
                setActiveRiderRequest(myRequested);
                // keep in ride state if waiting
                if (viewState !== 'ride') setViewState('ride');
              } else {
                setActiveRiderRequest(null); // Clear if no active rider request
                if (viewState === 'ride') setViewState('searching'); // Go back to searching if active rider request is gone
              }
            } else {
              setActiveRiderRequest(null);
              if (viewState === 'ride') setViewState('searching');
            }
          }
        } catch (e) {
          console.error("Poll error", e);
        }
      };

      interval = setInterval(checkRequests, 3000);
      checkRequests();
    }
    return () => clearInterval(interval);
  }, [user, dbUser, viewState]);

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
          setUserLocation({ lat: 21.1458, lng: 79.0882 });
        }
      );
    }
  }, []);

  // 2. Fetch Directions & Rides when destination changes
  useEffect(() => {
    if (isLoaded && userLocation && destination && viewState === 'searching') {
      const fetchRouteAndRides = async () => {
        setIsSearching(true);
        const directionsService = new window.google.maps.DirectionsService();

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
            }
          }
        );

        try {
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
          setRides(res.data.candidates || res.data || []);

        } catch (e) {
          console.error("Failed to fetch carpools", e);
        } finally {
          setIsSearching(false);
        }
      }

      fetchRouteAndRides();
    }
  }, [isLoaded, userLocation, startLocation, destination, viewState]);

  const handleStartLocationSelect = (data) => {
    setStartLocation(data);
    setStartAddress(data.address);
  };

  const handleDestinationSelect = (data) => {
    setDestination(data);
    setSelectedRideId(null);
    setViewState('searching');
  };

  const handleSelectOption = (option) => {
    setSelectedRideId(option.id || option._id);
    setSelectedRide(option.original || option);
    if (option.type === 'car') {
      setViewState('details');
    }
  };

  const handleRequestRide = async (ride) => {
    if (!ride || !dbUser) return;
    try {
      const res = await api.post('/requests', {
        tripId: ride._id,
        userId: dbUser._id,
        seatsNeeded: 1,
        note: "Looking for a ride!"
      });
      setActiveRiderRequest({ ...res.data.request, status: 'requested' });
      setViewState('ride');
    } catch (e) {
      alert("Failed to request ride: " + (e.response?.data?.message || e.message));
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;
    try {
      const res = await api.put(`/requests/${incomingRequest._id}/status`, { status: "accepted" });
      setIncomingRequest(null);

      setActiveDriverRequest(res.data.request);
      setViewState('driver-active');
    } catch (e) {
      console.error(e);
      alert("Error accepting ride");
    }
  };

  const handleRideReset = () => {
    setViewState('searching');
    setDestination(null);
    setDirections(null);
    setStartLocation(null);
    setStartAddress("Current Location");
    setRides([]);
    setActiveRiderRequest(null);
    setActiveDriverRequest(null);
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
      <MapBackground
        userLocation={userLocation}
        destination={destination}
        directions={directions}
        rides={rides}
      />

      {/* Only show Search when not in active ride modes */}
      {viewState === 'searching' && (
        <>
          <HomeSearch
            startLocationValue={startAddress}
            onStartChange={(e) => setStartAddress(e.target.value)}
            onStartSelect={handleStartLocationSelect}
            onDestinationSelect={handleDestinationSelect}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
          {rides.length > 0 && destination && (
            <RideOptionsList
              rides={rides}
              alternatives={[]}
              selectedId={selectedRideId}
              onSelect={handleSelectOption}
            />
          )}
        </>
      )}

      {viewState === 'details' && selectedRide && (
        <CarpoolDetails
          ride={selectedRide}
          onBack={() => setViewState('searching')}
          onRequest={() => handleRequestRide(selectedRide)}
        />
      )}

      {/* Rider View */}
      {viewState === 'ride' && activeRiderRequest && (
        <RideStatusPanel
          ride={activeRiderRequest.trip} // Pass trip from populated request
          request={activeRiderRequest}
          isDriver={false}
          onReset={handleRideReset}
        />
      )}

      {/* Driver View */}
      {viewState === 'driver-active' && activeDriverRequest && (
        <RideStatusPanel
          ride={activeDriverRequest.trip}
          request={activeDriverRequest}
          isDriver={true}
          onReset={handleRideReset}
          onDriverArrived={() => {
            // Teleport Driver to Pickup Location (Trip Start)
            if (activeDriverRequest.trip?.startLocation?.coordinates) {
              const [lng, lat] = activeDriverRequest.trip.startLocation.coordinates;
              setUserLocation({ lat, lng });
              setStartLocation({
                address: activeDriverRequest.trip.startLocation.address,
                coordinates: [lng, lat]
              });
              // Also force map center update if map component watches userLocation
            }
          }}
        />
      )}

      <DriverRequestModal
        request={incomingRequest}
        onAccept={handleAcceptRequest}
        onDecline={() => setIncomingRequest(null)}
      />
    </div>
  );
}
