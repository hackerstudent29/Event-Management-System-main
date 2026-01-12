import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Map, Marker } from './map';

export function VenueLocationButton({ locationName, latitude, longitude, address }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Fallback coordinates if not provided
    const lat = latitude || 20.5937;
    const lng = longitude || 78.9629;

    return (
        <div className="w-full">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200 text-sm font-medium"
            >
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Venue Location</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                ) : (
                    <ChevronDown className="w-4 h-4" />
                )}
            </button>

            {/* Expandable Map */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                            {/* Map Header */}
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    {locationName || 'Event Venue'}
                                </h4>
                                {address && (
                                    <p className="text-xs text-slate-500 mt-0.5">{address}</p>
                                )}
                            </div>

                            {/* Map Container */}
                            <div className="h-64 relative">
                                <Map
                                    initialViewState={{
                                        longitude: lng,
                                        latitude: lat,
                                        zoom: 14
                                    }}
                                    className="w-full h-full"
                                >
                                    <Marker longitude={lng} latitude={lat}>
                                        <div className="relative">
                                            {/* Pulsing ring */}
                                            <div className="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping" />
                                            {/* Pin */}
                                            <div className="relative w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                                <MapPin className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </Marker>
                                </Map>
                            </div>

                            {/* Map Footer */}
                            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                                <span className="text-slate-600 font-mono">
                                    {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                                </span>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                >
                                    Open in Google Maps →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
