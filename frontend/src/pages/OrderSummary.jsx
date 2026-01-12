import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, Calculator, Ticket, ChevronLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import api from '../api/axios';
import { useMessage } from "../context/MessageContext";

export default function OrderSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { event, bookingPayload, purchasedItems } = state;

    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500 mb-8">Your tickets have been sent to your email.</p>
                    <div className="flex flex-col gap-3">
                        <Button className="w-full h-12 text-base" onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
                        <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/')}>Back to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">Checkout</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Payment Options */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-red-500" />
                            Payment Options
                        </h2>

                        <div className="grid gap-4">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500" />
                                <div className="ml-4 flex-1">
                                    <span className="block font-medium text-gray-900">Credit / Debit Card</span>
                                    <span className="block text-sm text-gray-500">Visa, Mastercard, RuPay</span>
                                </div>
                                <CreditCard className="h-6 w-6 text-gray-400" />
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500" />
                                <div className="ml-4 flex-1">
                                    <span className="block font-medium text-gray-900">UPI</span>
                                    <span className="block text-sm text-gray-500">Google Pay, PhonePe, Paytm</span>
                                </div>
                                <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10.2 16.6c-.3 0-.6-.1-.8-.3l-2.6-2.6c-.2-.2-.2-.5 0-.7.2-.2.5-.2.7 0l2.2 2.2 5.2-5.7c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-5.6 6.1c-.2.2-.4.3-.7.3z" /></svg>
                            </label>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 text-center italic">
                                    This is a demo payment gateway. No actual money will be deducted.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Share your contact details</h2>
                        <p className="text-sm text-gray-500 mb-4">We'll send the tickets to {bookingPayload?.[0]?.userId ? "your registered email" : "you"}.</p>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Email Address" disabled className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" value="Logged In User (Default)" />
                            <input type="text" placeholder="Phone Number" className="flex-1 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded mb-2 uppercase tracking-wide">
                                {event?.eventType || 'Event'}
                            </span>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">{event?.name || 'Event Name'}</h2>
                            <div className="flex items-center text-sm text-gray-500 gap-4">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    {event?.eventDate ? new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'TBD'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {event?.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event?.locationName || event?.venue || 'Venue TBD'}
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Ticket className="h-4 w-4 text-primary" />
                                Order Details
                            </h3>

                            <div className="space-y-4">
                                {(purchasedItems || []).map((item, index) => (
                                    <div key={index} className="flex justify-between items-center group">
                                        <div className="text-sm text-slate-500 font-medium">
                                            Ticket <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1 uppercase">{item.categoryName} × {item.count}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 leading-none">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.total)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Convenience Fee</span>
                                    <span className="font-bold text-slate-900 leading-none">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(convenienceFee)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-400 italic">Tax (18% GST on Fee)</span>
                                    <span className="text-xs font-bold text-slate-400 leading-none">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(gstAmount)}</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-2"></div>

                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <span className="block text-sm font-bold text-slate-950">Amount Payable</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Including all taxes</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-950 tracking-tighter">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Button
                                className="w-full h-12 text-base font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 rounded-lg"
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount || 0)}`
                                )}
                            </Button>
                            <p className="text-xs text-center text-gray-500 mt-3">
                                By proceeding, you agree to our Terms & Conditions
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
