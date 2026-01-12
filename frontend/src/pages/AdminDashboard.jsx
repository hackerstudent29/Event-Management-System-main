import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useMessage } from '../context/MessageContext';
import { DropdownCalendar } from '@/components/ui/dropdown-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrbitalClock } from '@/components/ui/orbital-clock';
import { ModernTimePicker } from '@/components/ui/modern-time-picker';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { DeleteEventDialog } from '@/components/ui/delete-event-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Map, Marker } from '@/components/ui/map';

const SEAT_CATEGORIES = [
    { name: "General Admission", color: "#22C55E" },
    { name: "Standard", color: "#3B82F6" },
    { name: "Silver", color: "#9CA3AF" },
    { name: "Gold", color: "#FACC15" },
    { name: "Platinum", color: "#A855F7" },
    { name: "Premium", color: "#6366F1" },
    { name: "Elite", color: "#EF4444" },
    { name: "VIP", color: "#F97316" },
    { name: "Front Row", color: "#14B8A6" },
    { name: "Balcony", color: "#64748B" },
];

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        eventDate: '',
        eventType: '',
        locationName: '',
        locationAddress: '',
        latitude: 20.5937, // Default India Center
        longitude: 78.9629
    });
    const [stats, setStats] = useState({ totalEvents: 0, totalBookings: 0, totalSeatsSold: 0 });
    const { showMessage } = useMessage();

    // Helper state for Date Picker
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("10:00");
    const [clockDate, setClockDate] = useState(new Date());

    // Category Configuration State
    const [categoryConfig, setCategoryConfig] = useState(
        SEAT_CATEGORIES.map(cat => ({
            ...cat,
            enabled: false,
            seats: "",
            price: "",
            position: "Front",
        }))
    );

    // Sync clock with selected time
    useEffect(() => {
        if (selectedDate) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours);
            d.setMinutes(minutes);
            setClockDate(d);
        } else {
            setClockDate(new Date());
        }
    }, [selectedDate, selectedTime]);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (error) {
            console.error("Failed to fetch events");
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/bookings/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats");
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchStats();
    }, []);

    // Effect to start with existing date if editing
    useEffect(() => {
        if (newEvent.id && newEvent.eventDate) {
            const d = new Date(newEvent.eventDate);
            if (!isNaN(d.getTime())) {
                setSelectedDate(d);
                const hours = d.getHours().toString().padStart(2, '0');
                const minutes = d.getMinutes().toString().padStart(2, '0');
                setSelectedTime(`${hours}:${minutes}`);
            }
        } else if (!newEvent.id && !newEvent.eventDate) {
            // Only reset to defaults if we are explicitly clearing/resetting the whole form
            setSelectedDate(null);
            setSelectedTime("10:00");
        }
    }, [newEvent.id]);

    const handleChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    // Special handler for Date/Time updates
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const combined = new Date(selectedDate);
            combined.setHours(hours);
            combined.setMinutes(minutes);

            const year = combined.getFullYear();
            const month = (combined.getMonth() + 1).toString().padStart(2, '0');
            const day = combined.getDate().toString().padStart(2, '0');
            const localIso = `${year}-${month}-${day}T${selectedTime}:00`;

            setNewEvent(prev => ({ ...prev, eventDate: localIso }));
        }
    }, [selectedDate, selectedTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Basic Validation
            if (!newEvent.name || !newEvent.eventType) {
                showMessage("Please fill in Event Name and Type.", { type: 'info' });
                return;
            }

            if (!selectedDate || !selectedTime) {
                showMessage("Please select both Date and Start Time.", { type: 'info' });
                return;
            }

            // 2. Construct precise ISO Date
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const dateObj = new Date(selectedDate);
            dateObj.setHours(hours);
            dateObj.setMinutes(minutes);

            // Format manually to YYYY-MM-DDTHH:mm:00 (LocalDateTime standard)
            const pad = (n) => n.toString().padStart(2, '0');
            const localIso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(hours)}:${pad(minutes)}:00`;

            // 3. Categories
            const enabledCategories = categoryConfig
                .filter(c => c.enabled)
                .map(c => ({
                    categoryName: c.name,
                    price: parseFloat(c.price) || 0,
                    totalSeats: parseInt(c.seats) || 0,
                    availableSeats: parseInt(c.seats) || 0,
                    arenaPosition: c.position || "Front",
                    color: c.color
                }));

            // 4. Final Payload
            const payload = {
                name: newEvent.name,
                description: newEvent.description,
                eventDate: localIso,
                eventType: newEvent.eventType,
                categories: enabledCategories,
                locationName: newEvent.locationName,
                locationAddress: newEvent.locationAddress,
                latitude: newEvent.latitude,
                longitude: newEvent.longitude
            };

            console.log("Submitting Event Payload:", payload);

            if (newEvent.id) {
                // UPDATE
                await api.put(`/events/${newEvent.id}`, payload);
                showMessage('Event updated successfully!', { type: 'success' });
            } else {
                // CREATE
                await api.post('/events', payload);
                showMessage('Event created successfully!', { type: 'success' });
            }

            fetchEvents();
            fetchStats();

            // 5. Reset form
            setNewEvent({ name: '', description: '', eventDate: '', eventType: '' });
            setSelectedDate(null);
            setSelectedTime("10:00");
            setCategoryConfig(
                SEAT_CATEGORIES.map(cat => ({
                    ...cat,
                    enabled: false,
                    seats: "",
                    price: "",
                    position: "Front",
                }))
            );
        } catch (error) {
            console.error("Event Creation/Update Error Full:", error);
            let errorMessage = error.response?.data?.message || error.message || 'Failed to process event.';
            showMessage(errorMessage, { type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/events/${id}`);
            showMessage('Event deleted successfully!', { type: 'success' });
            fetchEvents();
            fetchStats();
        } catch (error) {
            showMessage('Failed to delete event', { type: 'error' });
        }
    };

    const handleCancelEvent = async (id, reason) => {
        try {
            await api.post(`/events/${id}/cancel`, { reason });
            showMessage('Event cancelled successfully!', { type: 'success' });
            fetchEvents();
            fetchStats();
        } catch (error) {
            showMessage('Failed to cancel event', { type: 'error' });
        }
    };

    const handleEdit = (event) => {
        setNewEvent({
            id: event.id,
            name: event.name,
            description: event.description,
            eventDate: event.eventDate,
            eventType: event.eventType,
            locationName: event.locationName || '',
            locationAddress: event.locationAddress || '',
            latitude: Number(event.latitude) || 20.5937,
            longitude: Number(event.longitude) || 78.9629
        });

        // Sync categories
        const updatedConfig = SEAT_CATEGORIES.map(baseCat => {
            const existing = event.categories?.find(c => c.categoryName === baseCat.name);
            if (existing) {
                return {
                    ...baseCat,
                    enabled: true,
                    seats: existing.totalSeats.toString(),
                    price: existing.price.toString(),
                    position: existing.arenaPosition
                };
            }
            return { ...baseCat, enabled: false, seats: "", price: "", position: "Front" };
        });
        setCategoryConfig(updatedConfig);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-2">Manage your events and settings.</p>
                    </div>
                    <div className="hidden md:block transform scale-75 origin-bottom-right">
                        <OrbitalClock date={clockDate} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Events</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalEvents}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Bookings</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Seats Sold</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalSeatsSold}</p>
                    </div>
                </div>

                {/* Main Form Island */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] divide-x divide-slate-100">
                        {/* LEFT: Create Event */}
                        <div>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h2 className="text-xl font-bold text-slate-900">Create Event</h2>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Event Name</label>
                                    <input
                                        name="name"
                                        placeholder="e.g. Summer Music Festival"
                                        value={newEvent.name}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Event Type</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none flex items-center justify-between text-left"
                                            >
                                                <span className={cn(!newEvent.eventType && "text-slate-400")}>
                                                    {newEvent.eventType || "Select Type"}
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                            <DropdownMenuItem onClick={() => setNewEvent({ ...newEvent, eventType: 'Concert' })}>
                                                Concert
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewEvent({ ...newEvent, eventType: 'Theatre' })}>
                                                Theatre
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewEvent({ ...newEvent, eventType: 'Stadium' })}>
                                                Stadium
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewEvent({ ...newEvent, eventType: 'Private Party' })}>
                                                Private Party
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewEvent({ ...newEvent, eventType: 'Auditorium' })}>
                                                Auditorium
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Detail what this event is about..."
                                        rows="4"
                                        value={newEvent.description}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                    />
                                </div>

                                {/* Event Location Map */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-700">Event Location</label>
                                        <span className="text-xs text-slate-500">Tap map or search to set location</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                className="w-full h-10 pl-9 pr-20 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white outline-none"
                                                placeholder="Search places..."
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const q = e.target.value;
                                                        if (!q) return;
                                                        try {
                                                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
                                                            const data = await res.json();
                                                            if (data && data.length > 0) {
                                                                const { lat, lon, display_name } = data[0];
                                                                setNewEvent(prev => ({
                                                                    ...prev,
                                                                    latitude: Number(lat),
                                                                    longitude: Number(lon),
                                                                    locationAddress: display_name,
                                                                    zoom: 15
                                                                }));
                                                            }
                                                        } catch (err) {
                                                            console.error("Search failed", err);
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">ENTER</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            name="locationName"
                                            placeholder="Venue Name (e.g. JLN Stadium)"
                                            value={newEvent.locationName || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white transition-all outline-none"
                                        />
                                        <input
                                            name="locationAddress"
                                            placeholder="Full Address"
                                            value={newEvent.locationAddress || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="h-[300px] w-full rounded-lg border border-slate-200 overflow-hidden relative z-0">
                                        <Map
                                            initialViewState={{
                                                longitude: Number(newEvent.longitude) || 78.9629,
                                                latitude: Number(newEvent.latitude) || 20.5937,
                                                zoom: newEvent.zoom || 5
                                            }}
                                            className="w-full h-full"
                                            onClick={(pos) => setNewEvent(prev => ({ ...prev, ...pos }))}
                                        >
                                            <Marker
                                                longitude={Number(newEvent.longitude) || 78.9629}
                                                latitude={Number(newEvent.latitude) || 20.5937}
                                                draggable={true}
                                                onDragEnd={(pos) => setNewEvent(prev => ({ ...prev, ...pos }))}
                                            />
                                        </Map>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Event Date</label>
                                        <ModernDatePicker
                                            date={selectedDate}
                                            setDate={setSelectedDate}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Start Time</label>
                                        <ModernTimePicker
                                            value={selectedTime}
                                            onChange={setSelectedTime}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Seat Categories */}
                        <div>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h2 className="text-xl font-bold text-slate-900">Seat Categories</h2>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-4">Enable categories and configure seats/prices.</p>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {categoryConfig?.map((cat, index) => (
                                        <div
                                            key={cat.name}
                                            className={cn(
                                                "border rounded-xl p-3 transition-all",
                                                cat.enabled ? "bg-slate-50 border-slate-300" : "border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="block rounded-full"
                                                        style={{ background: cat.color, width: '12px', height: '12px' }}
                                                    />
                                                    <strong className="text-sm text-slate-700">{cat.name}</strong>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={cat.enabled}
                                                    onChange={(e) => {
                                                        const updated = [...categoryConfig];
                                                        updated[index].enabled = e.target.checked;
                                                        setCategoryConfig(updated);
                                                    }}
                                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                                />
                                            </div>

                                            {cat.enabled && (
                                                <div className="grid grid-cols-3 gap-2 mt-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Seats"
                                                        value={cat.seats}
                                                        onChange={(e) => {
                                                            const updated = [...categoryConfig];
                                                            updated[index].seats = e.target.value;
                                                            setCategoryConfig(updated);
                                                        }}
                                                        className="h-9 w-full px-2 rounded border border-slate-300 text-sm"
                                                    />

                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Price"
                                                            value={cat.price}
                                                            onChange={(e) => {
                                                                const updated = [...categoryConfig];
                                                                updated[index].price = e.target.value;
                                                                setCategoryConfig(updated);
                                                            }}
                                                            className="h-9 w-full pl-6 pr-2 rounded border border-slate-300 text-sm"
                                                        />
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="h-9 w-full px-2 rounded border border-slate-300 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
                                                            >
                                                                <span>{cat.position}</span>
                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                            {['Front', 'Center', 'Back', 'Upper', 'Lower', 'Balcony'].map((pos) => (
                                                                <DropdownMenuItem
                                                                    key={pos}
                                                                    onClick={() => {
                                                                        const updated = [...categoryConfig];
                                                                        updated[index].position = pos;
                                                                        setCategoryConfig(updated);
                                                                    }}
                                                                >
                                                                    {pos}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Full-width Submit Section */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5"
                        >
                            {newEvent.id ? 'Update Event Details' : 'Create New Event'}
                        </button>

                        {newEvent.id && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewEvent({ name: '', description: '', eventDate: '', eventType: '' });
                                    setSelectedDate(null);
                                    setSelectedTime("10:00");
                                }}
                                className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {/* Manage Events Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-xl font-bold text-slate-900">Manage Events</h2>
                    </div>

                    <div className="p-0">
                        {events.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No events created yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-xs font-semibold text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {events.map(event => (
                                            <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{event.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{new Date(event.eventDate).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 inline-block w-fit">{event.eventType}</span>
                                                        {event.cancelled && (
                                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">Cancelled</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {!event.cancelled && (
                                                            <button type="button" className="text-primary hover:text-primary/80 font-medium text-xs px-3 py-1 bg-primary/10 rounded" onClick={() => handleEdit(event)}>Edit</button>
                                                        )}
                                                        <DeleteEventDialog
                                                            onConfirm={() => handleDelete(event.id)}
                                                            onCancelEvent={(reason) => handleCancelEvent(event.id, reason)}
                                                            trigger={
                                                                <button type="button" className="text-red-500 hover:text-red-600 font-medium text-xs px-3 py-1 bg-red-50 rounded">Delete</button>
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
