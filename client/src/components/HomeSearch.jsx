import React from 'react';
import { Search, MapPin, Navigation, MapPinIcon } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';

export default function HomeSearch({ onDestinationSelect, onStartSelect, startLocationValue, onStartChange, onUseCurrentLocation }) {
    const [isFromFocused, setIsFromFocused] = React.useState(false);

    const handleFromFocus = (e) => {
        setIsFromFocused(true);
        if (startLocationValue === "Current Location") {
            // Clear it to allow typing
            // calling parent's onStartChange with empty string
            onStartChange({ target: { value: "" } });
        }
    };

    return (
        <div className="absolute top-4 left-4 right-4 z-10 md:w-96 md:left-8">
            <div className="bg-card/95 backdrop-blur-sm border border-border shadow-xl rounded-2xl p-4 space-y-4">
                {/* From Input */}
                <div className="relative flex items-center group">
                    <div className="absolute left-3 z-10 text-primary">
                        <MapPinIcon size={18} fill="currentColor" className="text-primary" />
                    </div>
                    <LocationSearchInput
                        placeholder="Current Location"
                        value={startLocationValue}
                        onChange={onStartChange}
                        onSelect={onStartSelect}
                        onFocus={handleFromFocus}
                        onBlur={() => setTimeout(() => setIsFromFocused(false), 200)} // Delay to allow click
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                    />
                </div>

                {/* Use Current Location Option */}
                {isFromFocused && (
                    <div
                        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 rounded-lg text-primary bg-primary/5 transition-colors"
                        onClick={() => {
                            onUseCurrentLocation();
                            setIsFromFocused(false);
                        }}
                    >
                        <Navigation size={16} fill="currentColor" />
                        <span className="text-sm font-medium">Use Current Location</span>
                    </div>
                )}

                {/* Connector Line */}
                <div className="absolute top-[46px] left-[22px] w-[2px] h-6 bg-border/50"></div>

                {/* To Input (Autocomplete) */}
                <div className="relative flex items-center group">
                    <div className="absolute left-3 z-10 text-foreground">
                        <MapPin size={18} fill="currentColor" className="text-foreground" />
                    </div>
                    <LocationSearchInput
                        placeholder="Where to?"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                        onSelect={onDestinationSelect}
                    />
                    <div className="absolute right-3 p-1.5 bg-background rounded-lg shadow-sm border border-border/50">
                        <Search size={14} className="text-foreground" />
                    </div>
                </div>
            </div>
        </div>
    );
}
