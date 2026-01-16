import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, MapPin, Ticket, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import api from '../api/axios';
import { useMessage } from "../context/MessageContext";
import { cn } from "@/lib/utils";
import { getDefaultEventImage } from "../lib/image-utils";

export default function OrderSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { event, bookingPayload, purchasedItems } = state;

    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const { showMessage } = useMessage();

    // Fallback if accessed directly without state
    if (!event || !purchasedItems) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <p className="text-gray-500 mb-4">No booking details found.</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    // Safety check for past events
    const isPast = event?.eventDate && new Date(event.eventDate) < new Date();
    if (isPast) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Expired</h2>
                <p className="text-gray-500 mb-8 max-w-sm">This event has already finished. Booking is no longer possible.</p>
                <Button onClick={() => navigate('/')}>Find More Events</Button>
            </div>
        );
    }

    // Calculation logic - unified tiered logic (30 + 15*(n-1) with 18% GST)
    const ticketPrice = Number((purchasedItems || []).reduce((acc, item) => acc + Number(item.total || 0), 0));
    const totalQty = Number((purchasedItems || []).reduce((acc, item) => acc + Number(item.count || 0), 0));
    const convenienceFee = totalQty > 0 ? (30.00 + Math.max(0, totalQty - 1) * 15.00) : 0;
    const gstAmount = Number((convenienceFee * 0.18).toFixed(2));
    const totalAmount = ticketPrice + convenienceFee + gstAmount;

    const handlePayment = async () => {
        if (!bookingPayload || bookingPayload.length === 0) {
            showMessage("Invalid booking data.", { type: 'error' });
            return;
        }

        setIsProcessing(true);
        try {
            // Execute all booking requests in parallel
            // Note: payload includes eventId which backend ignores via DTO binding
            await Promise.all(
                bookingPayload.map(payload => api.post('/bookings', payload))
            );

            // Simulation of payment processing delay
            setTimeout(() => {
                if (typeof setBookingConfirmed === 'function') {
                    setBookingConfirmed(true);
                }
                setIsProcessing(false);
            }, 1000);

        } catch (error) {
            console.error("Booking Error:", error);
            setIsProcessing(false);

            // Safe message extraction (handle raw string or object)
            const responseData = error.response?.data;
            const errorMsg = (typeof responseData === 'string' ? responseData : responseData?.message) ||
                error.message ||
                "Network error. Please try again.";

            showMessage("Payment Failed: " + errorMsg, { type: 'error' });
        }
    };

    if (bookingConfirmed) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-slate-500 mb-8">Your tickets have been sent to your email.</p>
                    <div className="flex flex-col gap-3">
                        <Button className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800" onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
                        <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/')}>Back to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                        Secure Checkout
                    </div>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Payment & Contact */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Contact (Passive Confirmation) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">Contact Details</h3>
                            <p className="text-slate-500 text-sm">
                                Tickets will be sent to <span className="font-semibold text-slate-900">{bookingPayload?.[0]?.userId || "your registered email"}</span> and via SMS to your phone.
                            </p>
                        </div>
                        <button className="ml-auto text-sm font-medium text-blue-600 hover:underline">Edit</button>
                    </div>

                    {/* 2. Payment Options (Compact & Focused) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                Payment Method
                            </h2>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {/* UPI Option */}
                            <label className={cn("relative flex flex-col p-6 cursor-pointer transition-colors", paymentMethod === 'upi' ? "bg-blue-50/10" : "hover:bg-slate-50")}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => setPaymentMethod('upi')}
                                        className="w-5 h-5 text-slate-900 border-slate-300 focus:ring-slate-900"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900">UPI</span>
                                            <div className="flex gap-2 opacity-80 grayscale transition-all data-[state=active]:grayscale-0" data-state={paymentMethod === 'upi' ? 'active' : ''}>
                                                {/* Simple CSS Icons or SVGs for GPay/PhonePe placeholders */}
                                                <div className="h-5 w-8 bg-slate-200 rounded"></div>
                                                <div className="h-5 w-8 bg-slate-200 rounded"></div>
                                                <div className="h-5 w-8 bg-slate-200 rounded"></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Google Pay, PhonePe, Paytm, BHIM</p>
                                    </div>
                                </div>

                                {/* Expanded State for UPI */}
                                {paymentMethod === 'upi' && (
                                    <div className="mt-4 ml-9 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                            <p className="text-sm text-slate-600 mb-3">Pay securely with any UPI app</p>
                                            <div className="flex gap-3">
                                                <button className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Google Pay</button>
                                                <button className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">PhonePe</button>
                                                <button className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Paytm</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </label>

                            {/* Card Option */}
                            <label className={cn("relative flex flex-col p-6 cursor-pointer transition-colors", paymentMethod === 'card' ? "bg-blue-50/10" : "hover:bg-slate-50")}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="w-5 h-5 text-slate-900 border-slate-300 focus:ring-slate-900"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-slate-900">Credit / Debit Card</span>
                                        <p className="text-sm text-slate-500 mt-1">Visa, Mastercard, RuPay</p>
                                    </div>
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                </div>

                                {/* Expanded State for Card */}
                                {paymentMethod === 'card' && (
                                    <div className="mt-4 ml-9 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                            <p className="text-sm text-slate-500 italic">Card fields would appear here (Demo Mode)</p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Trust Seals */}
                    <div className="flex items-center justify-center gap-6 text-slate-400 grayscale opacity-60 mt-4">
                        <div className="text-xs uppercase font-bold tracking-widest flex items-center gap-1">
                            <span className="text-lg">🔒</span> 100% Secure
                        </div>
                        <div className="h-4 w-px bg-slate-300"></div>
                        <div className="text-xs uppercase font-bold tracking-widest">256-bit Encryption</div>
                    </div>
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24 overflow-hidden">
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                            <img
                                src={event?.imageUrl || getDefaultEventImage(event?.eventType)}
                                alt={event?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const fallback = getDefaultEventImage(event?.eventType);
                                    if (e.target.src !== fallback) {
                                        e.target.src = fallback;
                                    }
                                }}
                            />
                        </div>
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-lg">{event?.name || "Event Name"}</h3>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Date TBD'}
                            </div>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {event?.locationName || "Venue"}
                            </div>
                            {bookingPayload && (
                                <div className="mt-3 pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Seats</div>
                                    <div className="text-sm font-semibold text-slate-700">
                                        {bookingPayload.map(b => b.seatId?.includes('::') ? b.seatId.split('::')[1] : b.seatId).join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Tickets ({totalQty})</span>
                                    <span className="font-medium text-slate-900">₹{ticketPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Convenience Fee</span>
                                    <span className="font-medium text-slate-900">₹{convenienceFee}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>GST (18%)</span>
                                    <span className="font-medium text-slate-900">₹{gstAmount}</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100"></div>

                            <div className="flex justify-between items-end">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="font-black text-2xl text-slate-900">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                                </span>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        Pay {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                                <span className="text-green-500">🛡️</span> Safe & Secure Payment
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
