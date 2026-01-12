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
    ParkingSquare, Train
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    useEffect(() => {
        if (!event?.categories) return;

        const fetchAllOccupied = async () => {
            try {
                const allOccupied = [];
                await Promise.all(event.categories.map(async (cat) => {
                    const res = await api.get(`/bookings/occupied/${cat.id}`);
                    // IDs from server are "rowSeat" e.g., "D5"
                    // We need to prepend catId:: to match our frontend format
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
        };

        fetchAllOccupied();
        // Refresh every 30 seconds for live updates
        const interval = setInterval(fetchAllOccupied, 30000);
        return () => clearInterval(interval);
    }, [event]);

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
                enableHighAccuracy: false, // Use network location (faster, less accurate)
                timeout: 10000, // 10 second timeout
                maximumAge: 300000 // Accept cached position up to 5 minutes old
            }
        );
    };

    // 3. Fetch Nearby Amenities (Parking & Public Transport)
    const fetchNearbyAmenities = useCallback(async (lat, lon) => {
        if (!lat || !lon) return;

        setLoadingAmenities(true);
        try {
            // Overpass API query for parking and public transport within 1km
            const radius = 1000; // meters
            const query = `
                [out:json][timeout:25];
                (
                  node(around:${radius},${lat},${lon})[amenity=parking];
                  node(around:${radius},${lat},${lon})[railway=station];
                  node(around:${radius},${lat},${lon})[railway=subway_entrance];
                  node(around:${radius},${lat},${lon})[highway=bus_stop];
                );
                out body;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`
            });

            if (!response.ok) {
                console.warn(`Overpass API returned status ${response.status}`);
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("Overpass API did not return JSON");
                return;
            }

            const data = await response.json();

            // Separate parking and transit
            const parking = [];
            const transit = [];

            data.elements.forEach(element => {
                const item = {
                    id: element.id,
                    lat: element.lat,
                    lon: element.lon,
                    name: element.tags?.name || 'Unnamed',
                    type: element.tags?.amenity || element.tags?.railway || element.tags?.highway
                };

                if (element.tags?.amenity === 'parking') {
                    parking.push({ ...item, capacity: element.tags?.capacity });
                } else {
                    transit.push(item);
                }
            });

            setNearbyParking(parking.slice(0, 5)); // Top 5 closest
            setNearbyTransit(transit.slice(0, 5));

        } catch (error) {
            console.error('Failed to fetch amenities:', error);
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
    const seatLayout = useMemo(() => {
        let categoriesToRender = event?.categories;
        if (!categoriesToRender || categoriesToRender.length === 0) {
            categoriesToRender = [
                { id: 'mock-vip', categoryName: 'VIP (Demo)', price: 1500, totalSeats: 20, availableSeats: 5, color: '#f59e0b' },
                { id: 'mock-gen', categoryName: 'General (Demo)', price: 500, totalSeats: 60, availableSeats: 48, color: '#3b82f6' }
            ];
        }

        return categoriesToRender.map((cat, catIndex) => {
            const seatsPerRow = cat.totalSeats > 30 ? 12 : 8;
            const effectiveTotalSeats = Number(cat.totalSeats || 0);
            const effectiveAvailable = Number(cat.availableSeats ?? 0);
            const totalRows = Math.ceil(effectiveTotalSeats / seatsPerRow);
            const occupiedCount = Math.max(0, effectiveTotalSeats - effectiveAvailable);
            let currentSeatIndex = 0;
            const rows = [];

            for (let r = 0; r < totalRows; r++) {
                const rowId = String.fromCharCode(65 + r + (catIndex * 3));
                const rowSeats = [];
                for (let s = 1; s <= seatsPerRow; s++) {
                    if (currentSeatIndex >= effectiveTotalSeats) break;
                    // No longer simulating based on count - occupancy is handled via 'occupiedSeatIds' memo
                    const seatId = `${cat.id}::${rowId}${s}`;
                    rowSeats.push({ id: seatId, number: s, isOccupied: false });
                    currentSeatIndex++;
                }
                rows.push({ rowId, seats: rowSeats });
            }
            return {
                categoryName: cat.categoryName,
                price: cat.price,
                rows,
                categoryId: cat.id,
                color: cat.color
            };
        });
    }, [event]);

    // 4. Booking Handling
    const handleSeatClick = (seatId) => {
        setSelectedSeatIds(prev => prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]);
    };

    const handleBook = async () => {
        if (!user) return navigate('/login');
        if (selectedSeatIds.length === 0) return showMessage('Select at least one seat.', { type: 'info' });

        const bookingsByCat = {};
        selectedSeatIds.forEach(id => {
            const catId = id.split('::')[0];
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
    const currentPrice = selectedSeatIds.reduce((total, seatId) => {
        const catId = seatId.split('::')[0];
        const category = seatLayout.find(c => c.categoryId === catId);
        return total + (category ? Number(category.price) : 0);
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
        // Use the real IDs fetched from the server
        return occupiedSeatIdsFromServer;
    }, [occupiedSeatIdsFromServer]);


    if (loading) return <div className="flex justify-center items-center min-h-screen text-slate-400 font-medium">Loading event...</div>;
    if (!event) return <div className="text-center py-20 text-slate-500">Event not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            {/* 1. Navbar / Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="text-lg">←</span> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-base font-bold text-slate-900 leading-tight">{event.name}</h1>
                        <p className="text-xs text-slate-500">{new Date(event.eventDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {event.eventType || 'Event'}</p>
                    </div>
                    <div className="w-16"></div> {/* Spacer */}
                </div>
            </div>

            <main className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* LEFT COLUMN: SEATS + MAP */}
                    <div className="space-y-8">

                        {/* A. Arena / Seats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                    <TicketIcon className="w-4 h-4" /> Select Seats
                                </h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span><span className="text-xs text-slate-500">Sold</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></span><span className="text-xs text-slate-500">Available</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-xs text-slate-500">Selected</span></div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-10 bg-slate-900 min-h-[400px] flex justify-center">
                                {/* Dark themed stage area */}
                                <SeatSelection
                                    layout={seatLayout}
                                    selectedSeats={selectedSeatIds}
                                    occupiedSeats={occupiedSeatIds}
                                    onSeatSelect={handleSeatClick}
                                    className="bg-transparent"
                                />
                            </div>
                        </div>

                        {/* B. Venue & Directions (Moved Here) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-xl">
                                {/* Controls */}
                                <div className="md:col-span-5 p-6 bg-white flex flex-col justify-between space-y-6">
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
                                            <Navigation className="w-4 h-4" /> Get Directions
                                        </h2>

                                        {/* Inputs */}
                                        <div className="space-y-3 relative">
                                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                                                <input
                                                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                                    placeholder="Enter city or address"
                                                    value={manualLoc || (userLoc ? "Current Location" : "")}
                                                    onChange={(e) => { setManualLoc(e.target.value); setUserLoc(null); }}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter' && manualLoc) {
                                                            try {
                                                                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLoc)}`);
                                                                const data = await res.json();
                                                                if (data && data.length > 0) {
                                                                    const newLoc = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
                                                                    setUserLoc(newLoc);
                                                                    setMapCenter({ ...newLoc, zoom: 14 }); // Zoom to searched location
                                                                    showMessage("Location found!", { type: 'success' });
                                                                } else {
                                                                    showMessage("Location not found. Try a different search.", { type: 'error' });
                                                                }
                                                            } catch (err) {
                                                                showMessage("Search failed. Please try again.", { type: 'error' });
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={requestLocation}
                                                    className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="Use my location"
                                                >
                                                    <LocateFixed className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Dotted Line */}
                                            <div className="absolute left-[19px] top-8 bottom-8 w-px border-l border-dashed border-slate-300"></div>

                                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                                <div className="text-sm font-semibold text-slate-900 truncate">{event.locationName || event.venue || "Event Venue"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modes */}
                                    <div className="space-y-4">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Transport Mode</p>
                                        <div className="flex gap-2">
                                            <TransportMode label="Car" icon={Car} active={transportMode === 'driving'} onClick={() => setTransportMode('driving')} />
                                            <TransportMode label="Bike" icon={Bike} active={transportMode === 'cycling'} onClick={() => setTransportMode('cycling')} />
                                            <TransportMode label="Walk" icon={Footprints} active={transportMode === 'walking'} onClick={() => setTransportMode('walking')} />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    {routeStats && (
                                        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="text-2xl font-bold leading-none">{(routeStats.duration / 60).toFixed(0)} <span className="text-sm font-normal text-slate-400">min</span></div>
                                                <div className="text-xs text-slate-400 mt-1">Fastest route</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold">{(routeStats.distance / 1000).toFixed(1)} km</div>
                                                <div className="text-xs text-slate-400">Distance</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Map */}
                                <div className="md:col-span-7 h-[300px] md:h-auto bg-slate-100 relative min-h-[350px]">
                                    <Map
                                        initialViewState={{
                                            longitude: mapCenter?.longitude || Number(event.longitude) || 78.9629,
                                            latitude: mapCenter?.latitude || Number(event.latitude) || 20.5937,
                                            zoom: mapCenter?.zoom || 13
                                        }}
                                        className="w-full h-full"
                                        onClick={(coords) => {
                                            setUserLoc({ latitude: coords.latitude, longitude: coords.longitude });
                                            setMapCenter({ latitude: coords.latitude, longitude: coords.longitude, zoom: 14 });
                                            setManualLoc(''); // Clear manual input
                                            showMessage("Starting location set on map", { type: 'success' });
                                        }}
                                    >
                                        <Marker longitude={Number(event.longitude) || 78.9629} latitude={Number(event.latitude) || 20.5937} />
                                        {userLoc && (
                                            <>
                                                <Marker longitude={userLoc.longitude} latitude={userLoc.latitude}>
                                                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative">
                                                        <div className="absolute -inset-1 bg-blue-500/30 rounded-full animate-ping"></div>
                                                    </div>
                                                </Marker>
                                                <MapRoute
                                                    from={{ lng: userLoc.longitude, lat: userLoc.latitude }}
                                                    to={{ lng: event.longitude, lat: event.latitude }}
                                                    profile={transportMode === 'cycling' ? 'driving' : transportMode === 'walking' ? 'foot' : 'driving'} // Adjust mapping for OSRM
                                                    onRouteStats={handleRouteStats}
                                                />
                                            </>
                                        )}

                                        {/* Parking & Transit Markers */}
                                        {nearbyParking.slice(0, 3).map((spot) => (
                                            <Marker key={`p-${spot.id}`} longitude={spot.lon} latitude={spot.lat}>
                                                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center shadow">
                                                    <ParkingSquare className="w-3 h-3 text-white" />
                                                </div>
                                            </Marker>
                                        ))}
                                        {nearbyTransit.slice(0, 3).map((stop) => (
                                            <Marker key={`t-${stop.id}`} longitude={stop.lon} latitude={stop.lat}>
                                                <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center shadow">
                                                    <Train className="w-3 h-3 text-white" />
                                                </div>
                                            </Marker>
                                        ))}

                                        {/* Hint overlay when no location set */}
                                        {!userLoc && (
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200">
                                                    <p className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                                        <MapPin className="w-3 h-3" />
                                                        Click on map to set your location
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </Map>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BOOKING SUMMARY */}
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="px-6 py-6 border-b border-slate-50">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Booking Summary</h2>
                            </div>

                            {selectedSeatIds.length > 0 ? (
                                <div className="p-6 space-y-6 animate-in fade-in duration-500">
                                    {/* Item List */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-sm text-slate-500 font-medium">{selectedSeatIds.length} x Tickets</span>
                                            <span className="font-bold text-slate-900">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPrice)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-sm text-slate-500 font-medium">Convenience Fee</span>
                                            <span className="font-bold text-slate-900">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(convenienceFee)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-400 italic">Tax (18% GST on Fee)</span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(gst)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100"></div>

                                    {/* Total Payable */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="block text-sm font-bold text-slate-950">Amount Payable</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Including all taxes</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-slate-950 tracking-tighter">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPayable)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seats Section */}
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Selected Seats</p>
                                            <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                                                {selectedSeatIds.length} Total
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeatIds.map(id => (
                                                <span key={id} className="min-w-[40px] h-9 flex items-center justify-center text-xs font-bold bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm">
                                                    {id.split('::')[1]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        <button
                                            onClick={handleBook}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 group"
                                        >
                                            <span className="text-sm">Proceed to Checkout</span>
                                            <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                                        </button>
                                        <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <p className="text-[10px] text-slate-600 font-medium">Safe & Secure Payment</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <TicketIcon className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">Your cart is empty</h3>
                                    <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed">Select your preferred seats from the arena to proceed.</p>
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="bg-slate-100 p-5 rounded-xl">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Important Info</h3>
                            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                                <li>Tickets are non-refundable.</li>
                                <li>Entry allowed only 30 mins before show.</li>
                                <li>Carry a valid ID proof.</li>
                            </ul>
                        </div>

                        {/* Nearby Amenities */}
                        {(nearbyParking.length > 0 || nearbyTransit.length > 0) && (
                            <div className="space-y-4">
                                {/* Parking */}
                                {nearbyParking.length > 0 && (
                                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <ParkingSquare className="w-4 h-4" />
                                            Nearby Parking
                                        </h3>
                                        <div className="space-y-2">
                                            {nearbyParking.map((spot, idx) => (
                                                <div key={spot.id} className="flex items-start gap-2 text-xs">
                                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{spot.name}</p>
                                                        {spot.capacity && <p className="text-slate-500 text-[10px]">{spot.capacity} spots</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Public Transport */}
                                {nearbyTransit.length > 0 && (
                                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Train className="w-4 h-4" />
                                            Public Transport
                                        </h3>
                                        <div className="space-y-2">
                                            {nearbyTransit.map((stop, idx) => (
                                                <div key={stop.id} className="flex items-start gap-2 text-xs">
                                                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{stop.name}</p>
                                                        <p className="text-slate-500 text-[10px] capitalize">{stop.type.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default EventDetail;
