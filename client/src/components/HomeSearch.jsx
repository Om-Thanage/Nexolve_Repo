import React from 'react';
import { Search, MapPin } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';

export default function HomeSearch({ onDestinationSelect, onStartSelect }) {
    return (
        <div className="absolute top-4 left-4 right-4 z-10 md:w-96 md:left-8">
            <div className="bg-card/95 backdrop-blur-sm border border-border shadow-xl rounded-2xl p-4 space-y-4">
                {/* From Input */}
                <div className="relative flex items-center">
                    <div className="absolute left-3 w-2 h-2 bg-primary rounded-full"></div>
                    {/* We can make this editable later, for now it's static 'Current Location' or we allow edit */}
                    <input
                        type="text"
                        value="Current Location"
                        readOnly
                        className="w-full pl-8 pr-4 py-3 bg-secondary/50 rounded-xl text-sm font-medium focus:outline-none cursor-default text-muted-foreground"
                    />
                </div>

                {/* Connector Line */}
                <div className="absolute top-[46px] left-[19px] w-[2px] h-6 bg-border/50"></div>

                {/* To Input (Autocomplete) */}
                <div className="relative flex items-center group">
                    <div className="absolute left-3 w-2 h-2 bg-foreground rounded-sm"></div>
                    <LocationSearchInput
                        placeholder="Where to?"
                        className="w-full pl-8 pr-4 py-3 bg-secondary/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
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
