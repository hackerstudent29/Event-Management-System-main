import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Calendar, MapPin, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationMap } from '@/components/ui/expand-map';
const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [emailingId, setEmailingId] = useState(null);

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

            // Calculation matches standard: 30 fee + 18% GST (35.40 total fee)
            const price = booking.eventCategory?.price || 0;
            const seats = booking.seatsBooked || 0;
            categoryGroup.totalAmount += (price * seats) + 35.40;

            if (booking.status !== 'CANCELLED') {
                categoryGroup.status = booking.status;
            }
        });

        return Object.values(groups).map(group => ({
            event: group.event,
            bookings: Object.values(group.bookingsByCategory)
        })).sort((a, b) =>
            new Date(b.event.eventDate || 0) - new Date(a.event.eventDate || 0)
        );
    }, [bookings]);

    const handleEmailTicket = async (e, id) => {
        e.stopPropagation();
        setEmailingId(id);
        try {
            await api.post(`/bookings/${id}/email-ticket`);
            if (window.toast) window.toast("Ticket sent to your email", "success");
        } catch (error) {
            if (window.toast) window.toast("Failed to send ticket", "error");
        } finally {
            setEmailingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 sm:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-slate-900" />
                            My Bookings
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your event passes and history.</p>
                    </div>
                    <Button onClick={() => navigate('/')} variant="secondary" size="sm" className="text-xs h-9">Find Events</Button>
                </div>

                {groupedBookings.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-12 text-center border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">You haven't booked any events yet.</p>
                        <Button onClick={() => navigate('/')} className="mt-4 bg-slate-900 text-white" size="sm">Explore Events</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedBookings.map((group) => {
                            const { event, bookings: groupBookings } = group;
                            const isAllCancelled = groupBookings.every(b => b.status === 'CANCELLED');

                            return (
                                <div key={event.id} className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 
                                               ${isAllCancelled ? 'border-slate-100 opacity-75' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                                    <div className="flex flex-col md:flex-row border-b border-slate-100 bg-slate-50/50">
                                        <div className="w-full md:w-32 p-4 flex flex-row md:flex-col items-center justify-center gap-1 bg-white md:bg-transparent border-b md:border-b-0 md:border-r border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {event.eventDate ? new Date(event.eventDate).toLocaleString('default', { month: 'short' }) : '---'}
                                            </span>
                                            <span className="text-2xl font-bold text-slate-900 leading-none">
                                                {event.eventDate ? new Date(event.eventDate).getDate() : '--'}
                                            </span>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-center">
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                {event.name}
                                                {isAllCancelled && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Cancelled</span>}
                                            </h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-60" />{event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}</div>
                                                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-60" />{event.locationName || event.eventType}</div>
                                            </div>
                                        </div>
                                        {(event.locationName || event.latitude || event.longitude) && (
                                            <div className="p-5 border-l border-slate-100 flex items-center justify-center">
                                                <LocationMap location={event.locationName || event.eventType} latitude={event.latitude} longitude={event.longitude} address={event.locationAddress} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="divide-y divide-slate-50">
                                        {groupBookings.map(categoryGroup => {
                                            const category = categoryGroup.category || {};
                                            const isCancelled = categoryGroup.status === 'CANCELLED';
                                            const totalAmount = categoryGroup.totalAmount;

                                            return (
                                                <div key={categoryGroup.firstBookingId} className="p-4 md:p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tight ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{categoryGroup.status}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">#{categoryGroup.firstBookingId.toString().slice(0, 8).toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-sm font-semibold text-slate-700">{categoryGroup.totalSeats} × {category.categoryName}</p>
                                                            <p className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</p>
                                                        </div>
                                                    </div>
                                                    {!isCancelled && (
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Button variant="outline" size="sm" onClick={() => navigate(`/ticket/${categoryGroup.firstBookingId}?view=invoice`)} className="h-8 text-xs font-semibold">
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                View Invoice
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => navigate(`/ticket/${categoryGroup.firstBookingId}`)} className="h-8 text-xs font-semibold">View Ticket</Button>
                                                            <Button variant="ghost" size="sm" onClick={(e) => handleEmailTicket(e, categoryGroup.firstBookingId)} disabled={emailingId === categoryGroup.firstBookingId} className="h-8 w-8 p-0" title="Email Ticket">
                                                                <Mail className={`w-4 h-4 text-slate-500 ${emailingId === categoryGroup.firstBookingId ? 'animate-pulse text-primary' : ''}`} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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

export default MyBookings;
