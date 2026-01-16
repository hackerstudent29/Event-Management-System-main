import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, User, ArrowUpDown } from 'lucide-react';
import { getDefaultEventImage } from '../lib/image-utils';
import { useAuth } from '../context/AuthContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('upcoming');
    const [showAccountSheet, setShowAccountSheet] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data || []);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const sortedEvents = useMemo(() => {
        if (!events || events.length === 0) return [];

        const now = new Date();
        const nowTime = now.getTime();

        let result = [...events];

        result.sort((a, b) => {
            const dateA = new Date(a.eventDate);
            const dateB = new Date(b.eventDate);
            const isEndedA = dateA.getTime() < nowTime;
            const isEndedB = dateB.getTime() < nowTime;

            if (isEndedA && !isEndedB) return 1;
            if (!isEndedA && isEndedB) return -1;

            if (sortBy === 'upcoming') {
                return dateA - dateB;
            }
            if (sortBy === 'latest') {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
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
            if (sortBy === 'name') {
                return (a.name || '').localeCompare(b.name || '');
            }
            return 0;
        });

        return result;
    }, [events, sortBy]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
            {/* Top Bar - Responsive */}
            <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900">Events</h1>
                    <button
                        onClick={() => setShowAccountSheet(true)}
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden"
                        aria-label="Account"
                    >
                        <User className="w-5 h-5 text-slate-700" />
                    </button>
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Ticket className="w-4 h-4" />
                            <span className="text-sm font-medium">My Bookings</span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Profile</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
                {/* Sort Controls - Mobile Optimized */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 max-w-[240px]">
                        <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 text-sm font-semibold text-slate-700 bg-transparent">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent align="start" className="rounded-xl">
                                <SelectItem value="upcoming">🗓️ Upcoming</SelectItem>
                                <SelectItem value="latest">🆕 Latest</SelectItem>
                                <SelectItem value="trending">🔥 Trending</SelectItem>
                                <SelectItem value="priceLow">💰 Low Price</SelectItem>
                                <SelectItem value="priceHigh">💎 High Price</SelectItem>
                                <SelectItem value="name">🔤 A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
                        {sortedEvents.length}
                    </div>
                </div>

                {sortedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-slate-900">No Events Found</h2>
                        <p className="text-slate-500">Check back later for new experiences.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {sortedEvents.map((event) => {
                            const isEnded = new Date(event.eventDate) < new Date();
                            const isToday = new Date(event.eventDate).toDateString() === new Date().toDateString();
                            const minPrice = Math.min(...(event.categories?.map(c => c.price) || [0]));

                            return (
                                <div
                                    key={event.id}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all"
                                >
                                    {/* Event Image */}
                                    <Link to={`/events/${event.id}`} className="block relative">
                                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                                            <img
                                                src={
                                                    (typeof event.imageUrl === 'string' && event.imageUrl.startsWith('http'))
                                                        ? event.imageUrl
                                                        : getDefaultEventImage(event.eventType)
                                                }
                                                alt={event.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = getDefaultEventImage(event.eventType);
                                                }}
                                            />
                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3">
                                                {isToday && !isEnded && (
                                                    <div className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                                                        LIVE
                                                    </div>
                                                )}
                                                {isEnded && (
                                                    <div className="bg-slate-700/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold">
                                                        ENDED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Event Info */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <Link to={`/events/${event.id}`} className="block mb-2">
                                            <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                                                {event.name}
                                            </h3>
                                        </Link>

                                        <div className="space-y-1.5 mb-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs">
                                                    {new Date(event.eventDate).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs truncate">{event.locationName || 'Chennai'}</span>
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="mt-auto pt-3 border-t border-slate-100">
                                            {minPrice > 0 && (
                                                <p className="text-xs text-slate-500 mb-2">
                                                    From <span className="font-bold text-slate-900">₹{minPrice}</span>
                                                </p>
                                            )}
                                            {isEnded ? (
                                                <Button
                                                    disabled
                                                    className="w-full h-11 bg-slate-200 text-slate-500 cursor-not-allowed"
                                                >
                                                    Booking Closed
                                                </Button>
                                            ) : (
                                                <Button
                                                    asChild
                                                    className="w-full h-11"
                                                >
                                                    <Link to={`/events/${event.id}`}>
                                                        <Ticket className="w-4 h-4 mr-2" />
                                                        Book Now
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventList;
