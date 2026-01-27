import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SeatSelection } from '@/components/ui/seat-selection';
import { useMessage } from '../context/MessageContext';
import { Map, Marker, MapRoute } from '@/components/ui/map';
import {
    Navigation, Car, Bike, Footprints, Bus,
    MapPin, Search, Calendar, Clock, Ticket as TicketIcon, LocateFixed,
    ParkingSquare, Train, ChevronLeft, Home, Briefcase, School
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateGapPositions, getGapRuleForSubtype } from '@/lib/gap-utils';
import { getDefaultEventImage } from '../lib/image-utils';

const TransportMode = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-all border w-16 h-16",
            active
                ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        )}
    >
        <Icon className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showMessage } = useMessage();

    // Data States
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // User Location & Routing States
    const [userLoc, setUserLoc] = useState(null);
    const [locAccess, setLocAccess] = useState('prompt'); // prompt, granted, denied
    const [manualLoc, setManualLoc] = useState('');
    const [transportMode, setTransportMode] = useState('driving'); // driving, cycling, walking
    const [routeStats, setRouteStats] = useState(null);

    // Booking States
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    // Map control state
    const [mapCenter, setMapCenter] = useState(null);

    // Nearby amenities
    const [nearbyParking, setNearbyParking] = useState([]);
    const [nearbyTransit, setNearbyTransit] = useState([]);
    const [loadingAmenities, setLoadingAmenities] = useState(false);
    const [occupiedSeatIdsFromServer, setOccupiedSeatIdsFromServer] = useState([]);
    const [savedLocations, setSavedLocations] = useState([]);

    // 1. Fetch Event
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data);
            } catch (error) {
                console.error("Failed to fetch event", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    // 1.5 Fetch Occupied Seats
    const fetchAllOccupied = useCallback(async () => {
        if (!event?.categories || !Array.isArray(event.categories)) return;
        try {
            const allOccupied = [];
            await Promise.all(event.categories.map(async (cat) => {
                const res = await api.get(`/bookings/occupied/${cat.id}`);
                if (Array.isArray(res.data)) {
                    res.data.forEach(id => {
                        allOccupied.push(`${cat.id}::${id}`);
                    });
                }
            }));
            setOccupiedSeatIdsFromServer(allOccupied);
        } catch (err) {
            console.error("Failed to fetch occupied seats", err);
        }
    }, [event?.categories]);

    useEffect(() => {
        if (!event?.categories) return;

        fetchAllOccupied();
        // Refresh every 30 seconds for live updates
        const interval = setInterval(fetchAllOccupied, 30000);
        return () => clearInterval(interval);
    }, [event?.categories, fetchAllOccupied]);

    // 1.6 Fetch User Saved Locations
    useEffect(() => {
        if (!user) return;
        const fetchSavedLocations = async () => {
            try {
                const res = await api.get(`/users/locations/${user.id}`);
                setSavedLocations(res.data);
            } catch (err) {
                console.error("Failed to fetch saved locations", err);
            }
        };
        fetchSavedLocations();
    }, [user]);

    // 2. Location Logic
    const requestLocation = () => {
        if (!("geolocation" in navigator)) {
            showMessage("Geolocation is not supported by your browser", { type: 'error' });
            return;
        }

        showMessage("Detecting location...", { type: 'info' });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setUserLoc(newLoc);
                setMapCenter({ ...newLoc, zoom: 14 }); // Zoom to detected location
                setLocAccess('granted');
                showMessage("Location detected successfully!", { type: 'success' });
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLocAccess('denied');

                let errorMsg = "Could not get location. ";
                switch (err.code) {
                    case 1: // PERMISSION_DENIED
                        errorMsg += "Permission denied. Please enable location access.";
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMsg += "Location unavailable. Try enabling WiFi/GPS or enter manually.";
                        break;
                    case 3: // TIMEOUT
                        errorMsg += "Request timed out. Please try again.";
                        break;
                    default:
                        errorMsg += "Please enter your location manually.";
                }
                showMessage(errorMsg, { type: 'error' });
            },
            {
                enableHighAccuracy: true, // Use GPS for better accuracy
                timeout: 15000,
                maximumAge: 0 // Force fresh location
            }
        );
    };

    // 3. Fetch Nearby Amenities (Parking & Public Transport)
    const fetchNearbyAmenities = useCallback(async (lat, lon) => {
        if (!lat || !lon) return;

        setLoadingAmenities(true);
        try {
            // Overpass API query for parking and public transport within 500m (optimized)
            const radius = 500; // Reduced from 1000m to prevent timeouts
            const query = `
                [out:json][timeout:10];
                (
                  node(around:${radius},${lat},${lon})[amenity=parking];
                  node(around:${radius},${lat},${lon})[railway=station];
                  node(around:${radius},${lat},${lon})[railway=subway_entrance];
                );
                out body;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`
            });

            if (!response.ok) {
                // Silently fail on timeout/server error to not alarm user
                if (response.status !== 504 && response.status !== 503) {
                    console.warn(`Overpass API info result: ${response.status}`);
                }
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return;
            }

            const data = await response.json();

            // Separate parking and transit
            const parking = [];
            const transit = [];

            if (data && data.elements) {
                data.elements.forEach(element => {
                    const item = {
                        id: element.id,
                        lat: element.lat,
                        lon: element.lon,
                        name: element.tags?.name || 'Unnamed',
                        type: element.tags?.amenity || element.tags?.railway
                    };

                    if (element.tags?.amenity === 'parking') {
                        parking.push({ ...item, capacity: element.tags?.capacity });
                    } else {
                        transit.push(item);
                    }
                });
            }

            setNearbyParking(parking.slice(0, 3));
            setNearbyTransit(transit.slice(0, 3));

        } catch (error) {
            // Ignore network errors for amenities
        } finally {
            setLoadingAmenities(false);
        }
    }, []);

    // Fetch amenities when event loads
    useEffect(() => {
        if (event?.latitude && event?.longitude) {
            fetchNearbyAmenities(event.latitude, event.longitude);
        }
    }, [event, fetchNearbyAmenities]);

    // 3. Seat Layout Transformation (Memoized)
    const { seatLayout, gapSeatIds } = useMemo(() => {
        let categoriesToRender = event?.categories;
        if (!categoriesToRender || !Array.isArray(categoriesToRender) || categoriesToRender.length === 0) {
            categoriesToRender = [
                { id: 'mock-vip', categoryName: 'VIP (Demo)', price: 1500, totalSeats: 20, availableSeats: 5, color: '#f59e0b' },
                { id: 'mock-gen', categoryName: 'General (Demo)', price: 500, totalSeats: 60, availableSeats: 48, color: '#3b82f6' }
            ];
        }

        const collectedGapIds = [];

        // Generate full layout
        const layout = categoriesToRender.map((cat, index) => {
            const totalSeats = cat.totalSeats || 20;

            // Calculate real available seats
            const catOccupiedCount = occupiedSeatIdsFromServer.filter(id => id.startsWith(cat.id + '::')).length;
            const calculatedAvailable = Math.max(0, totalSeats - catOccupiedCount);

            // Generate seats split into rows (max 20 per row)
            let rows = [];
            let isCustomLayout = false;
            let debugIndices = []; // DEBUG

            // 1. Try to parse Admin-configured Rows (from arenaPosition)
            // Use Regex for robustness against whitespace/casing mixed content
            const rawPos = cat.arenaPosition || cat.arena_position;
            const rowMatch = typeof rawPos === 'string' ? rawPos.match(/rows:([^;]+)/i) : null;
            const colMatch = typeof rawPos === 'string' ? rawPos.match(/cols:(\d+)/i) : null;

            if (rowMatch) {
                try {
                    const rowLabels = rowMatch[1].split(',').map(s => s.trim()).filter(Boolean);
                    const seatsPerRow = colMatch ? parseInt(colMatch[1]) : 20;

                    let seatCounter = 1;

                    // Parse row labels to indices logic for gap filling
                    const parsedRows = rowLabels.map(l => {
                        const label = l.trim();
                        let index = parseInt(label);
                        if (isNaN(index)) {
                            // Try A-Z
                            index = label.toUpperCase().charCodeAt(0) - 64;
                        }
                        return { label, index };
                    }).sort((a, b) => a.index - b.index);

                    debugIndices = parsedRows.map(p => p.index); // DEBUG POPULATE

                    // Check if labels appear to be 1-based indices for A-Z
                    // If all labels are numeric and <= 26, we act as if they are A-Z indices
                    const autoConvertNumericToAlpha = parsedRows.every(p => !isNaN(parseInt(p.label)) && p.index <= 26);

                    if (parsedRows.length > 0) {
                        const minRow = 1; // Always start from Row A (Index 1)
                        const maxRow = parsedRows[parsedRows.length - 1].index;

                        for (let r = minRow; r <= maxRow; r++) {
                            // Is this row in the config?
                            const config = parsedRows.find(p => p.index === r);

                            // Determine row label
                            let currentLabel = config ? config.label : (
                                // Reconstruct label if missing (default fallback)
                                String.fromCharCode(64 + r)
                            );

                            if (autoConvertNumericToAlpha) {
                                currentLabel = String.fromCharCode(64 + r);
                            } else if (!config && !isNaN(parseInt(parsedRows[0].label))) {
                                // Keep numeric if origin was numeric and > 26
                                currentLabel = String(r);
                            }

                            const rowSeats = [];
                            for (let c = 1; c <= seatsPerRow; c++) {
                                const isGapRow = !config;

                                // SVG Map expects: categoryId::RowLabelColNumber (e.g. uuid::A1)
                                const seatNumberLabel = `${currentLabel}${c}`;
                                const fullId = `${cat.id}::${seatNumberLabel}`;

                                rowSeats.push({
                                    id: fullId,
                                    number: c,
                                    status: 'available', // Let 'isGap' handle the visual state, don't force 'occupied'
                                    isGap: isGapRow
                                });

                                if (isGapRow) collectedGapIds.push(fullId);
                                if (config) seatCounter++;
                            }

                            // Add row if it has seats (valid or gap)
                            if (rowSeats.length > 0) {
                                rows.push({
                                    id: `row-${cat.id}-${currentLabel}`,
                                    rowId: currentLabel,
                                    seats: rowSeats
                                });
                            }
                        }
                    } // End of parsedRows logic

                    if (rows.length > 0) isCustomLayout = true;
                } catch (e) {
                    console.warn("Failed to parse row config", e);
                }
            }

            // 2. Fallback: Generate generic rows if no custom config found
            if (!isCustomLayout) {
                const seatsPerRow = 20;
                const rowCount = Math.ceil(totalSeats / seatsPerRow);

                for (let r = 0; r < rowCount; r++) {
                    const rowSeats = [];
                    const startSeat = r * seatsPerRow + 1;
                    const endSeat = Math.min(startSeat + seatsPerRow - 1, totalSeats);
                    const rowLabel = String.fromCharCode(65 + r);

                    for (let i = startSeat; i <= endSeat; i++) {
                        const colNum = (i - startSeat) + 1;
                        const fullId = `${cat.id}::${rowLabel}${colNum}`;
                        rowSeats.push({
                            id: fullId,
                            number: colNum,
                            status: 'available'
                        });
                    }

                    rows.push({
                        id: `row-${cat.id}-${r}`,
                        rowId: rowLabel,
                        seats: rowSeats
                    });
                }
            }

            return {
                id: cat.id,
                categoryName: cat.categoryName,
                name: cat.categoryName,
                availableSeats: cat.availableSeats !== undefined ? cat.availableSeats : calculatedAvailable,
                price: cat.price || 500,
                color: cat.color || '#3b82f6',
                rows: rows,
                isCustom: isCustomLayout,
                debugIndices: debugIndices
            };
        });

        return { seatLayout: layout, gapSeatIds: collectedGapIds };
    }, [event?.categories, event?.eventSubType, occupiedSeatIdsFromServer]);

    const handleSeatClick = (seatId, mode = 'toggle') => {
        const [newCatId] = seatId.split('::');

        setSelectedSeatIds(prev => {
            // If in single-zone mode (Best Available), we typically only want seats from ONE category at a time
            if (mode === 'single-zone') {
                const hasDifferentCategory = prev.length > 0 && prev.some(id => id.split('::')[0] !== newCatId);
                if (hasDifferentCategory) {
                    // Switch to the new category entirely
                    return [seatId];
                }
            }

            // Normal Toggle Behavior
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const handleBook = async () => {
        if (!user) {
            // Redirect to login but store intent
            navigate('/login');
            // optionally save pending booking
            return;
        }

        if (selectedSeatIds.length === 0) {
            showMessage("Please select at least one seat.", { type: 'error' });
            return;
        }

        // Aggregate by category
        const bookingsByCat = {};
        selectedSeatIds.forEach(id => {
            const [catId] = id.split('::');
            bookingsByCat[catId] = (bookingsByCat[catId] || 0) + 1;
        });

        const purchasedItems = Object.entries(bookingsByCat).map(([catId, count]) => {
            const cat = event?.categories?.find(c => c.id === catId);
            const price = cat ? cat.price : (catId === 'mock-vip' ? 1500 : 500);
            const name = cat ? cat.categoryName : (catId === 'mock-vip' ? 'VIP (Demo)' : 'General (Demo)');
            return {
                categoryId: catId,
                categoryName: name,
                count: count,
                pricePerSeat: price,
                total: count * price
            };
        });

        const bookingPayload = Object.entries(bookingsByCat).map(([catId, count]) => ({
            eventId: id,
            eventCategoryId: catId,
            userId: user.id,
            seats: count,
            seatIds: selectedSeatIds.filter(sid => sid.startsWith(catId)).map(sid => sid.split('::')[1])
        }));

        // Send hold request for each category before navigating
        try {
            await Promise.all(bookingPayload.map(payload => api.post('/bookings/hold', payload)));
        } catch (err) {
            console.error("Failed to hold seats:", err);
            // We continue anyway, as the hold is a 'nice to have' layer on top of locking
        }

        navigate('/order-summary', { state: { event, bookingPayload, purchasedItems } });
    };

    // Calculation (Standardized tiered logic)
    const currentPrice = (selectedSeatIds || []).reduce((total, seatId) => {
        const catId = seatId.split('::')[0];
        const category = seatLayout.find(c => String(c.id) === String(catId));
        const price = category ? Number(category.price) : 0;
        return total + (isNaN(price) ? 0 : price);
    }, 0);

    const qty = selectedSeatIds.length;
    const convenienceFee = qty > 0 ? (30.00 + Math.max(0, qty - 1) * 15.00) : 0;
    const gst = Number((convenienceFee * 0.18).toFixed(2));
    const totalPayable = currentPrice + convenienceFee + gst;

    // Stabilize route stats callback to prevent infinite loop
    const handleRouteStats = useCallback((stats) => {
        setRouteStats(stats);
    }, []);

    // Compute occupied seats list
    const occupiedSeatIds = useMemo(() => {
        // Only include generated gaps if we are in the basic Grid mode, not the visual SVG maps
        const useVisuals = layoutVariant && !['Simple', 'Grid', 'Default'].includes(layoutVariant);
        const isTheatreGrid = eventType === 'Theatre' && !useVisuals;

        return isTheatreGrid
            ? [...occupiedSeatIdsFromServer, ...gapSeatIds]
            : occupiedSeatIdsFromServer;
    }, [occupiedSeatIdsFromServer, gapSeatIds, layoutVariant, eventType]);


    if (loading) return <div className="flex justify-center items-center min-h-screen text-slate-400 font-medium">Loading event...</div>;
    if (!event) return <div className="text-center py-20 text-slate-500">Event not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-900">
            {/* 1. Navbar (Absolute Positioning for Reliability) */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 h-14 w-full shadow-sm">
                <div className="relative w-full h-full flex items-center justify-center container mx-auto px-4 max-w-5xl">
                    {/* Left: Back Button (Absolute & Protected) */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full text-slate-800 transition-colors z-20 border border-slate-100 shadow-sm bg-white"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Center: Title (Constrained width) */}
                    <div className="flex flex-col items-center max-w-[60%]">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate w-full text-center">{event.name}</h1>
                            {new Date(event.eventDate) < new Date() && (
                                <span className="bg-slate-200 text-slate-600 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Ended</span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center opacity-80">
                            {new Date(event.eventDate).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} • {event.locationName || event.venue}
                        </span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">

                {/* Event Info Card (New) */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row gap-6">
                    {/* Left: Event Image */}
                    <div className="w-full md:w-1/3 aspect-[3/4] md:aspect-auto md:h-80 overflow-hidden bg-slate-100 shrink-0">
                        <img
                            src={
                                (typeof event.imageUrl === 'string' && event.imageUrl.startsWith('http'))
                                    ? event.imageUrl
                                    : getDefaultEventImage(event.eventType)
                            }
                            alt={event.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loops
                                e.target.src = getDefaultEventImage(event.eventType);
                            }}
                        />
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 p-6 md:pl-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                {event.eventType || 'Event'}
                            </span>
                            {event.eventSubType && (
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                    {event.eventSubType}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                            {event.name}
                        </h1>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3 text-slate-600">
                                <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                                <div className="text-sm">
                                    <span className="font-bold">{new Date(event.eventDate).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin className="w-4 h-4 mt-0.5 text-red-500" />
                                <div className="text-sm">
                                    <span className="font-bold">{event.locationName || 'Venue'}</span>
                                    <div className="text-slate-500 mt-0.5">{event.locationAddress || 'Address not provided'}</div>
                                </div>
                            </div>
                        </div>

                        {event.description && (
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">About Event</h3>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                                    {event.description}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Seat Selection Card (Cleaner, focused) */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Choose Your Zone</h2>
                        <div className="flex gap-3 text-[10px] font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span>Sold</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-800"></span>Avail</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span>Selected</span>
                        </div>
                    </div>

                    <div className="p-4">
                        {new Date(event.eventDate) < new Date() ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Event has Ended</h3>
                                <p className="text-sm text-slate-500 max-w-[250px]">
                                    This event has already finished and is no longer available for booking.
                                </p>
                            </div>
                        ) : event.bookingOpenDate && new Date(event.bookingOpenDate) > new Date() ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-100">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500 animate-pulse">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Booking Opens Soon</h3>
                                <p className="text-sm text-slate-600 mb-2">
                                    Booking for this event will open on:
                                </p>
                                <div className="bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                                    <span className="text-blue-600 font-black">
                                        {new Date(event.bookingOpenDate).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="mx-2 text-slate-300">|</span>
                                    <span className="text-slate-900 font-bold">
                                        {new Date(event.bookingOpenDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                                    Stay Tuned
                                </div>
                            </div>
                        ) : (
                            <SeatSelection
                                layout={seatLayout}
                                selectedSeats={selectedSeatIds}
                                occupiedSeats={occupiedSeatIds}
                                onSeatSelect={handleSeatClick}
                                className="bg-transparent"
                                eventType={event.eventType}
                                eventSubType={event.eventSubType}
                                layoutVariant={event.seatingLayoutVariant}
                            />
                        )}
                    </div>
                </section>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                    <p>Tickets are zone-based. You will be assigned the best available seat in your selected category automatically.</p>
                </div>

                {/* 3. Journey Map (Restored & Simplified) */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Navigation className="w-4 h-4" /> Venue & Directions
                        </h2>
                    </div>
                    <div className="h-[300px] relative">
                        <Map
                            initialViewState={{
                                longitude: mapCenter?.longitude || (Number(event.longitude) || 77.5946),
                                latitude: mapCenter?.latitude || (Number(event.latitude) || 12.9716),
                                zoom: 13
                            }}
                            className="w-full h-full"
                        >
                            <Marker longitude={(Number(event.longitude) || 77.5946)} latitude={(Number(event.latitude) || 12.9716)}>
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl border-2 border-white">
                                    <MapPin className="w-4 h-4" />
                                </div>
                            </Marker>
                            {userLoc && (
                                <Marker longitude={userLoc.longitude} latitude={userLoc.latitude}>
                                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                </Marker>
                            )}
                            {userLoc && (
                                <MapRoute
                                    from={{ lng: userLoc.longitude, lat: userLoc.latitude }}
                                    to={{ lng: (Number(event.longitude) || 77.5946), lat: (Number(event.latitude) || 12.9716) }}
                                    profile={transportMode}
                                    onRouteStats={setRouteStats}
                                />
                            )}
                        </Map>

                        {/* Search Overlay */}
                        <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
                            <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-white/50 p-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                <input
                                    className="bg-transparent w-full text-xs font-medium outline-none"
                                    placeholder="Enter start location..."
                                    value={manualLoc}
                                    onChange={(e) => setManualLoc(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && manualLoc) {
                                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLoc)}`);
                                            const data = await res.json();
                                            if (data?.[0]) {
                                                const newLoc = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
                                                setUserLoc(newLoc); setMapCenter(newLoc);
                                            }
                                        }
                                    }}
                                />
                                <button onClick={requestLocation} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                    <LocateFixed className="w-3 h-3 text-slate-500" />
                                </button>
                            </div>

                            {/* Saved Locations Chips */}
                            {savedLocations.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                                    {savedLocations.map(loc => (
                                        <button
                                            key={loc.id}
                                            onClick={() => {
                                                const newLoc = { latitude: loc.latitude, longitude: loc.longitude };
                                                setUserLoc(newLoc);
                                                setMapCenter({ ...newLoc, zoom: 14 });
                                                setManualLoc(loc.address);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full border border-white/50 shadow-sm text-[10px] font-bold text-slate-700 hover:bg-white transition-all whitespace-nowrap"
                                        >
                                            {loc.label === 'Home' && <Home className="w-3 h-3 text-blue-500" />}
                                            {loc.label === 'Work' && <Briefcase className="w-3 h-3 text-emerald-500" />}
                                            {loc.label === 'Hostel' && <School className="w-3 h-3 text-orange-500" />}
                                            {loc.label !== 'Home' && loc.label !== 'Work' && loc.label !== 'Hostel' && <MapPin className="w-3 h-3 text-rose-500" />}
                                            {loc.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Docks (Transport Modes) */}
                    <div className="p-4 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-center border-t border-slate-100">
                        <div className="flex gap-2">
                            <TransportMode icon={Car} label="Drive" active={transportMode === 'driving'} onClick={() => setTransportMode('driving')} />
                            <TransportMode icon={Bike} label="Bike" active={transportMode === 'cycling'} onClick={() => setTransportMode('cycling')} />
                            <TransportMode icon={Footprints} label="Walk" active={transportMode === 'walking'} onClick={() => setTransportMode('walking')} />
                        </div>
                        {routeStats && (
                            <div className="pl-4 border-l border-slate-200">
                                <div className="text-xl font-bold text-slate-900">
                                    {Math.round(routeStats.duration / 60) >= 60
                                        ? `${Math.floor(Math.round(routeStats.duration / 60) / 60)} hr ${Math.round(routeStats.duration / 60) % 60} min`
                                        : `${Math.round(routeStats.duration / 60)} min`
                                    }
                                </div>
                                <div className="text-xs text-slate-500">{(routeStats.distance / 1000).toFixed(1)} km away</div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* 4. Floating Checkout Dock */}
            <div className={cn(
                "fixed bottom-20 md:bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-2xl bg-slate-900/90 backdrop-blur-md text-white shadow-2xl rounded-2xl p-1 z-40 transition-all duration-500 border border-white/10",
                selectedSeatIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"
            )}>
                <div className="flex items-center justify-between pl-6 pr-2 py-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="text-xl font-bold">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPayable)}
                            </div>
                            <div className="h-4 w-px bg-white/20"></div>
                            <div className="text-sm font-medium text-slate-300">
                                {selectedSeatIds.length} Ticket{selectedSeatIds.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                            {selectedSeatIds.map(id => id.split('::')[1]).join(', ')}
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        className="bg-white text-black hover:bg-slate-100 px-6 h-10 rounded-xl font-bold text-xs transition-all flex items-center gap-2 group"
                    >
                        <span>Proceed</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
