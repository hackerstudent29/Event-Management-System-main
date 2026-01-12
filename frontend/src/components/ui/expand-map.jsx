import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Map, Marker } from './map';

export function LocationMap({ location, latitude, longitude, address, className = "" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Fallback coordinates
    const lat = latitude || 20.5937;
    const lng = longitude || 78.9629;

    return (
        <>
            {/* Icon Button */}
            <div className={`relative ${className}`}>
                {!isExpanded && (
                    <motion.button
                        onClick={() => setIsExpanded(true)}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center group transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <MapPin className="w-4 h-4 text-slate-500 group-hover:text-primary" />
                    </motion.button>
                )}
            </div>

            {/* Expanded Map - Fixed Position Portal */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9999
                        }}
                        className="w-[360px] h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xl"
                    >
                        {/* Full Map Background */}
                        <div className="absolute inset-0">
                            <Map
                                initialViewState={{
                                    longitude: lng,
                                    latitude: lat,
                                    zoom: 15
                                }}
                                className="w-full h-full"
                            >
                                {/* Simple default marker - will show as a pin */}
                                <Marker longitude={lng} latitude={lat} />
                            </Map>
                        </div>

                        {/* Transparent gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />

                        {/* Map Header - NO WHITE BACKGROUND */}
                        <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2 text-white drop-shadow-lg">
                                <MapPin className="w-4 h-4" />
                                <div>
                                    <h4 className="font-semibold text-sm">
                                        {location || 'Event Venue'}
                                    </h4>
                                    {address && (
                                        <p className="text-xs opacity-90">{address}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                            >
                                <span className="text-slate-600 text-sm font-bold">✕</span>
                            </button>
                        </div>

                        {/* Map Footer - Transparent overlay */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between text-xs z-10">
                            <span className="text-white font-mono bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                            </span>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-emerald-600/90 backdrop-blur-sm hover:bg-emerald-700 px-3 py-1 rounded font-medium transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Open in Maps →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
