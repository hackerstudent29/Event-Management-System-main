import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, MapPin, FileText, User, LogOut, Key, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationMap } from '@/components/ui/expand-map';
import { getDefaultEventImage } from '../lib/image-utils';

const MyBookingsMobile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccountSheet, setShowAccountSheet] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await api.get('/bookings/my');
                setBookings(res.data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
                if (error.response?.status === 403 || error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, navigate]);

    const groupedBookings = useMemo(() => {
        const groups = {};
        bookings.forEach(booking => {
            const event = booking.eventCategory?.event;
            if (!event) return;

            if (!groups[event.id]) {
                groups[event.id] = {
                    event: event,
                    bookingsByCategory: {}
                };
            }

            const categoryId = booking.eventCategory?.id || 'unknown';
            if (!groups[event.id].bookingsByCategory[categoryId]) {
                groups[event.id].bookingsByCategory[categoryId] = {
                    category: booking.eventCategory,
                    bookings: [],
                    totalSeats: 0,
                    totalAmount: 0,
                    status: booking.status || 'CONFIRMED',
                    firstBookingId: booking.id,
                    transactionId: booking.transactionId,
                    bookingTime: booking.bookingTime
                };
            }

            const categoryGroup = groups[event.id].bookingsByCategory[categoryId];
            categoryGroup.bookings.push(booking);
            categoryGroup.totalSeats += (booking.seatsBooked || 0);

            if (booking.seatId) {
                if (!categoryGroup.seatLabels) categoryGroup.seatLabels = [];
                const label = booking.seatId.includes('::') ? booking.seatId.split('::')[1] : booking.seatId;
                categoryGroup.seatLabels.push(label);
            }

            const currentBookingTime = new Date(booking.bookingTime || 0).getTime();
            const existingBookingTime = new Date(categoryGroup.bookingTime || 0).getTime();
            if (currentBookingTime > existingBookingTime) {
                categoryGroup.bookingTime = booking.bookingTime;
            }

            const price = booking.eventCategory?.price || 0;
            const seats = booking.seatsBooked || 0;
            categoryGroup.totalAmount += (price * seats) + 35.40;

            if (booking.status !== 'CANCELLED') {
                categoryGroup.status = booking.status;
            }
        });

        return Object.values(groups).map(group => {
            const bookingsArray = Object.values(group.bookingsByCategory);
            const latestBookingTime = Math.max(...bookingsArray.map(b =>
                new Date(b.bookingTime || 0).getTime()
            ));
            return {
                event: group.event,
                bookings: bookingsArray,
                latestBookingTime: latestBookingTime
            };
        }).sort((a, b) =>
            b.latestBookingTime - a.latestBookingTime
        );
    }, [bookings]);

    const stats = useMemo(() => {
        const total = bookings.length;
        const totalSpent = bookings.reduce((sum, b) => {
            if (b.status === 'CANCELLED') return sum;
            const price = b.eventCategory?.price || 0;
            const seats = b.seatsBooked || 0;
            return sum + (price * seats) + 35.40;
        }, 0);
        const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
        return { total, totalSpent, cancelled };
    }, [bookings]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
            {/* Top Bar - Responsive */}
            <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900">My Bookings</h1>
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
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats - Responsive */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-white rounded-xl p-3 md:p-6 border border-slate-100 shadow-sm">
                        <div className="text-2xl md:text-4xl font-bold text-slate-900">{stats.total}</div>
                        <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-0.5 md:mt-1">Total Bookings</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 md:p-6 border border-slate-100 shadow-sm">
                        <div className="text-2xl md:text-4xl font-bold text-slate-900">₹{Math.round(stats.totalSpent)}</div>
                        <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-0.5 md:mt-1">Total Spent</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 md:p-6 border border-slate-100 shadow-sm">
                        <div className="text-2xl md:text-4xl font-bold text-red-600">{stats.cancelled}</div>
                        <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-0.5 md:mt-1">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Booking List - Responsive */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 space-y-3 md:space-y-4">
                {groupedBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 mt-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Ticket className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No bookings yet</h3>
                        <p className="text-sm text-slate-500 mb-4">Start exploring events</p>
                        <Button onClick={() => navigate('/')} className="w-full md:w-auto" size="default">
                            Explore Events
                        </Button>
                    </div>
                ) : (
                    groupedBookings.map((group) => {
                        const { event, bookings: groupBookings } = group;
                        const isAllCancelled = groupBookings.every(b => b.status === 'CANCELLED');

                        return (
                            <div key={event.id} className={`bg-white rounded-2xl overflow-hidden border ${isAllCancelled ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}>
                                {/* Event Header - Mobile Optimized */}
                                <div className="relative">
                                    <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                                        <img
                                            src={event.imageUrl || getDefaultEventImage(event.eventType)}
                                            alt={event.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const fallback = getDefaultEventImage(event.eventType);
                                                if (e.target.src !== fallback) {
                                                    e.target.src = fallback;
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <h2 className="text-lg font-bold text-white mb-1">{event.name}</h2>
                                        <div className="flex items-center gap-3 text-xs text-white/90">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBA'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {event.locationName || event.eventType}
                                            </div>
                                        </div>
                                    </div>
                                    {isAllCancelled && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            CANCELLED
                                        </div>
                                    )}
                                </div>

                                {/* Booking Details - One Per Category */}
                                <div className="divide-y divide-slate-50">
                                    {groupBookings.map(categoryGroup => {
                                        const category = categoryGroup.category || {};
                                        const isCancelled = categoryGroup.status === 'CANCELLED';
                                        const totalAmount = categoryGroup.totalAmount;

                                        return (
                                            <div key={categoryGroup.firstBookingId} className="p-4">
                                                {/* Primary Info */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {categoryGroup.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                #{categoryGroup.firstBookingId.toString().slice(0, 8).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-base font-semibold text-slate-900">
                                                            {categoryGroup.totalSeats} × {category.categoryName}
                                                        </p>
                                                        {categoryGroup.seatLabels && categoryGroup.seatLabels.length > 0 && (
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                Seats: {categoryGroup.seatLabels.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-slate-900">
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Primary Action - Full Width on Mobile */}
                                                {!isCancelled && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => navigate(`/ticket/${categoryGroup.firstBookingId}`)}
                                                            className="flex-1 h-11"
                                                            size="default"
                                                        >
                                                            <Ticket className="w-4 h-4 mr-2" />
                                                            View Ticket
                                                        </Button>
                                                        <Button
                                                            onClick={() => navigate(`/ticket/${categoryGroup.firstBookingId}?view=invoice`)}
                                                            variant="outline"
                                                            className="h-11 px-4"
                                                            size="default"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
};

export default MyBookingsMobile;
