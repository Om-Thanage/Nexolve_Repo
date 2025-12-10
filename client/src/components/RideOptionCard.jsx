import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bike, Clock, User } from 'lucide-react';

export default function RideOptionCard({ option, onClick, selected }) {
    const isSelected = selected === option._id || selected === option.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${isSelected
                ? 'bg-primary/10 border-2 border-primary shadow-sm'
                : 'bg-card border border-border hover:bg-secondary/50'
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {option.type === 'bike' ? <Bike size={24} /> : <Car size={24} />}
                </div>

                {/* Details */}
                <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                        {option.title || "Ryde"}
                        {option.seats && (
                            <span className="text-xs font-normal bg-background px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                                <User size={10} /> {option.seats}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                            {option.eta ? `${option.eta} min away` : '10 min away'}
                        </span>
                        • {option.desc || "Standard ride"}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="text-right">
                <div className="font-bold text-lg">₹{option.price}</div>
                {option.oldPrice && (
                    <div className="text-xs text-muted-foreground line-through">₹{option.oldPrice}</div>
                )}
            </div>
        </motion.div>
    );
}
