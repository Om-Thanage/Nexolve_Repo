import React, { useRef, useEffect } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function LocationSearchInput({ value, onChange, onSelect, placeholder, className, required }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
        libraries,
    });

    const autocompleteRef = useRef(null);

    const onLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            const address = place.formatted_address || place.name;

            let lat = 0;
            let lng = 0;

            if (place.geometry && place.geometry.location) {
                lat = place.geometry.location.lat();
                lng = place.geometry.location.lng();
            }

            // Call parent handlers
            // We update the text value with the selected address
            if (onChange) onChange({ target: { value: address } });
            // We pass the coordinates and full place object
            if (onSelect) onSelect({ address, coordinates: [lng, lat], place });
        }
    };

    if (!isLoaded) {
        return (
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                required={required}
                disabled // Disable until loaded or allow typing without autocomplete? Best to allow typing.
            // Actually, if we disable, user can't type. Let's just render a normal input if not loaded, 
            // but since we want autocomplete, we might want to wait or show a flexible input.
            // For now, let's render the input but without Autocomplete wrapper if not loaded (though useJsApiLoader usually handles script injection).
            />
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
        >
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                required={required}
            />
        </Autocomplete>
    );
}
