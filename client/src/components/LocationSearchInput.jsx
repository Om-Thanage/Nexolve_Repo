import React, { useRef, useEffect } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function LocationSearchInput({ value, onChange, onSelect, placeholder, className, required, ...props }) {
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
                disabled={false}
                {...props}
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
                {...props}
            />
        </Autocomplete>
    );
}
