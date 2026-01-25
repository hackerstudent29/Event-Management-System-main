import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, MapPin, Calendar, SortAsc, Filter, ArrowUpDown } from 'lucide-react';
import { getDefaultEventImage } from '../lib/image-utils';
import { useAuth } from '../context/AuthContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EventListDesktop = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('coming_soon');
    const [sortBy, setSortBy] = useState('upcoming');

    const { user } = useAuth(); // Get user from context

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let res;
                if (user && user.latitude && user.longitude) {
                    // Fetch nearby events if location is set
                    res = await api.get(`/events/nearby?lat=${user.latitude}&lng=${user.longitude}&radius=100`);
                } else {
                    // Default fetch all
                    res = await api.get('/events');
                }
                setEvents(res.data || []);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [user]); // Re-run when user changes (e.g. after location set)

    const filteredAndSortedEvents = useMemo(() => {
        if (!events || events.length === 0) return [];

        const now = new Date();
        const nowTime = now.getTime();

        let result = [...events];

        // 1. Filter Logic
        if (filter === 'live') {
            result = result.filter(e => !e.isCancelled && new Date(e.eventDate).toDateString() === now.toDateString());
        } else if (filter === 'coming_soon') {
            result = result.filter(e => !e.isCancelled && new Date(e.eventDate) > now && new Date(e.eventDate).toDateString() !== now.toDateString());
        } else if (filter === 'cancelled') {
            result = result.filter(e => e.isCancelled);
        } else if (filter === 'past') {
            result = result.filter(e => !e.isCancelled && new Date(e.eventDate) < now && new Date(e.eventDate).toDateString() !== now.toDateString());
        }

        // 2. Sort Logic
        result.sort((a, b) => {
            const dateA = new Date(a.eventDate);
            const dateB = new Date(b.eventDate);

            if (sortBy === 'upcoming') return dateA - dateB;
            if (sortBy === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'priceLow') {
                const minA = Math.min(...(a.categories?.map(c => c.price) || [0]), Infinity);
                const minB = Math.min(...(b.categories?.map(c => c.price) || [0]), Infinity);
                return minA - minB;
            }
            if (sortBy === 'priceHigh') {
                const minA = Math.min(...(a.categories?.map(c => c.price) || [0]), Infinity);
                const minB = Math.min(...(b.categories?.map(c => c.price) || [0]), Infinity);
                return minB - minA;
            }
            if (sortBy === 'trending') {
                const totalSeatsA = a.categories?.reduce((acc, c) => acc + (c.totalSeats || 0), 0) || 0;
                const totalSeatsB = b.categories?.reduce((acc, c) => acc + (c.totalSeats || 0), 0) || 0;
                return totalSeatsB - totalSeatsA;
            }
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

        return result;
    }, [events, sortBy, filter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 py-8">

                {/* Header Section */}
                <div className="flex flex-col gap-6 mb-8 border-b border-slate-200 pb-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Events in Chennai</h1>
                            <p className="text-slate-500 text-sm">Discover the best experiences happening in your city.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
                                <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 text-sm font-semibold text-slate-700 bg-transparent">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent align="end" className="rounded-xl border-slate-200">
                                        <SelectItem value="upcoming">🗓️ Upcoming First</SelectItem>
                                        <SelectItem value="latest">🆕 Recently Added</SelectItem>
                                        <SelectItem value="trending">🔥 Trending Now</SelectItem>
                                        <SelectItem value="priceLow">💰 Price: Low to High</SelectItem>
                                        <SelectItem value="priceHigh">💎 Price: High to Low</SelectItem>
                                        <SelectItem value="name">🔤 Alphabetical (A-Z)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl flex items-center justify-center min-w-[3.5rem]">
                                {filteredAndSortedEvents.length}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-8 translate-y-[1px]">
                        <button
                            onClick={() => setFilter('live')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${filter === 'live' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Live Now
                        </button>
                        <button
                            onClick={() => setFilter('coming_soon')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${filter === 'coming_soon' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Coming Soon
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${filter === 'cancelled' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Cancelled
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${filter === 'past' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Past Events
                        </button>
                    </div>
                </div>

                {filteredAndSortedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-slate-900">No Events Found</h2>
                        <p className="text-slate-500">Check back later for new experiences.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {filteredAndSortedEvents.map((event) => (
                            <div
                                key={event.id}
                                className="group flex flex-col gap-3"
                            >
                                {/* Card Image Container */}
                                <Link to={`/events/${event.id}`} className="block relative cursor-pointer">
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <img
                                            src={event.imageUrl || getDefaultEventImage(event.eventType)}
                                            alt={event.name}
                                            className={`w-full h-full object-cover ${event.isCancelled ? 'grayscale opacity-70' : ''}`}
                                            crossOrigin="anonymous"
                                            onLoad={() => console.log(`Loaded: ${event.imageUrl}`)}
                                            onError={(e) => {
                                                console.error(`Failed to load: ${event.imageUrl}`);
                                                e.target.onerror = null;
                                                e.target.src = getDefaultEventImage(event.eventType);
                                            }}
                                        />

                                        {/* Date Badge */}
                                        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                                            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 text-slate-900 border border-white/20">
                                                <Calendar className="w-3 h-3 text-blue-600" />
                                                {new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                            {event.isCancelled && (
                                                <div className="bg-red-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center border border-red-500 uppercase">
                                                    CANCELLED
                                                </div>
                                            )}
                                            {!event.isCancelled && new Date(event.eventDate).toDateString() === new Date().toDateString() && new Date(event.eventDate) > new Date() && (
                                                <div className="bg-amber-500 text-white px-2 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center animate-pulse border border-amber-400">
                                                    LIVE
                                                </div>
                                            )}
                                            {!event.isCancelled && new Date(event.eventDate) < new Date() && new Date(event.eventDate).toDateString() !== new Date().toDateString() && (
                                                <div className="bg-slate-700/80 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center border border-white/10 uppercase">
                                                    Ended
                                                </div>
                                            )}
                                            {!event.isCancelled && event.bookingOpenDate && new Date(event.bookingOpenDate) > new Date() && (
                                                <div className="bg-blue-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center animate-pulse border border-blue-500 uppercase">
                                                    Coming Soon
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                {/* Card Content */}
                                <div className="space-y-1">
                                    <Link to={`/events/${event.id}`} className="block">
                                        <h3 className={`text-lg font-bold leading-tight transition-colors line-clamp-1 ${event.isCancelled ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-primary'}`}>
                                            {event.name}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">{event.eventType || 'Event'}</span>
                                        <span>•</span>
                                        <span className="truncate max-w-[150px]">{event.locationName || 'Chennai'}</span>
                                    </div>
                                </div>

                                { /* Book Button */}
                                {event.isCancelled ? (
                                    <Button
                                        disabled
                                        className="w-full font-semibold rounded-lg mt-auto bg-red-50 text-red-400 border border-red-100 cursor-not-allowed hover:bg-red-50"
                                    >
                                        Cancelled
                                    </Button>
                                ) : new Date(event.eventDate) < new Date() ? (
                                    <Button
                                        disabled
                                        className="w-full font-semibold rounded-lg mt-auto bg-slate-200 text-slate-500 border-none cursor-not-allowed"
                                    >
                                        Booking Closed
                                    </Button>
                                ) : event.bookingOpenDate && new Date(event.bookingOpenDate) > new Date() ? (
                                    <Button
                                        asChild
                                        className="w-full font-semibold rounded-lg mt-auto bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                                    >
                                        <Link to={`/events/${event.id}`}>View Details</Link>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="w-full font-semibold rounded-lg mt-auto"
                                    >
                                        <Link to={`/events/${event.id}`}>Book Tickets</Link>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventListDesktop;
