import React, { useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, MapPin, Ticket, ChevronLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import api from '../api/axios';
import { useMessage } from "../context/MessageContext";
import { cn } from "@/lib/utils";
import { getDefaultEventImage } from "../lib/image-utils";
import { useAuth } from "../context/AuthContext";

export default function OrderSummary() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { event, bookingPayload, purchasedItems } = state;

    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("wallet");
    const [referenceId] = useState(crypto.randomUUID().slice(0, 8).toUpperCase()); // Short readable ref
    const [walletStatus, setWalletStatus] = useState('idle'); // idle, verifying
    const { showMessage } = useMessage();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    React.useEffect(() => {
        if (timeLeft <= 0) {
            showMessage("Session expired. Your seat hold has been released.", { type: 'error' });
            navigate('/');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate, showMessage]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    React.useEffect(() => {
        // Initialize STOMP connection
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://zendrum-backend.onrender.com/api';
        const wsUrl = backendUrl.replace('/api', '/ws-payment');

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            debug: (str) => {
                console.log("[STOMP] " + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = (frame) => {
            console.log("Connected to Payment WebSocket via STOMP");
            stompClient.subscribe("/topic/payment/" + referenceId, (message) => {
                const data = JSON.parse(message.body);
                console.log("Received Payment Update (STOMP):", data);
                if (data.status === 'SUCCESS') {
                    showMessage("Payment Successful (via Real-time)!", { type: 'success' });
                    setBookingConfirmed(true);
                } else {
                    showMessage(data.reason || "Payment Failed.", { type: 'error' });
                }
                setIsProcessing(false);
            });
        };

        stompClient.onStompError = (frame) => {
            console.error("STOMP error", frame.body);
        };

        stompClient.activate();

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [referenceId, showMessage]);

    const handleWalletPayment = async () => {
        setIsProcessing(true);
        setWalletStatus('verifying');

        try {
            // MERCHANT ID: f294121c-2340-4e91-bf65-b550a6e0d81a
            const merchantId = "f294121c-2340-4e91-bf65-b550a6e0d81a";
            // Use Payment Gateway API
            const PAYMENT_GATEWAY_URL = "https://payment-gateway-up7l.onrender.com/api/external";

            const response = await fetch(`${PAYMENT_GATEWAY_URL}/create-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'default-merchant-key' // In prod, this would be a secure key
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    referenceId: referenceId,
                    merchantId: merchantId,
                    callbackUrl: window.location.origin + '/payment-success?ref=' + referenceId
                })
            });

            const resData = await response.json();

            if (resData.success) {
                // Redirect to the payment page
                window.location.href = resData.data.paymentUrl;
            } else {
                showMessage("Payment Gateway Error: " + resData.message, { type: 'error' });
                setIsProcessing(false);
            }

        } catch (err) {
            console.error("Wallet Payment Error:", err);
            showMessage("Failed to connect to Payment Gateway.", { type: 'error' });
            setIsProcessing(false);
        }
    };

    const handlePayment = async () => {
        if (paymentMethod === 'wallet') {
            await handleWalletPayment();
            return;
        }

        if (!bookingPayload || bookingPayload.length === 0) {
            showMessage("Invalid booking data.", { type: 'error' });
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post('/payments/create-order', {
                amount: totalAmount,
                currency: "INR"
            });
            const orderData = orderRes.data;

            // 2. Load Razorpay Script
            const loadScript = (src) => {
                return new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = src;
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
            };

            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) {
                showMessage("Razorpay SDK failed to load. Are you online?", { type: 'error' });
                setIsProcessing(false);
                return;
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: "rzp_test_placeholder", // This should match backend key or be passed from it
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Event Booking",
                description: `Payment for ${event.name}`,
                image: event.imageUrl || "https://example.com/logo.png",
                order_id: orderData.id,
                handler: async function (response) {
                    // This function handles the success response from Razorpay
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        if (verifyRes.data === true) {
                            // 4. Confirm Booking on Backend with Payment Details
                            await Promise.all(
                                bookingPayload.map(payload => api.post('/bookings', {
                                    ...payload,
                                    paymentId: response.razorpay_payment_id,
                                    razorpayOrderId: response.razorpay_order_id
                                }))
                            );

                            setBookingConfirmed(true);
                            setIsProcessing(false);
                            showMessage("Booking & Payment Successful!", { type: 'success' });
                        } else {
                            showMessage("Payment verification failed.", { type: 'error' });
                            setIsProcessing(false);
                        }
                    } catch (err) {
                        console.error("Verification error", err);
                        showMessage("Error verifying payment.", { type: 'error' });
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || "Customer",
                    email: user?.email || "",
                    contact: ""
                },
                notes: {
                    address: "Event Booking Office"
                },
                theme: {
                    color: "#0f172a"
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Booking Error:", error);
            setIsProcessing(false);
            const responseData = error.response?.data;
            const errorMsg = (typeof responseData === 'string' ? responseData : responseData?.message) ||
                error.message || "Network error. Please try again.";
            showMessage("Payment Initialization Failed: " + errorMsg, { type: 'error' });
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
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-black text-amber-700 tabular-nums">
                            {formatTime(timeLeft)}
                        </span>
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
                            {/* Wallet App Option (New) */}
                            <label className={cn("relative flex flex-col p-6 cursor-pointer transition-colors", paymentMethod === 'wallet' ? "bg-indigo-50/10" : "hover:bg-slate-50")}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="wallet"
                                        checked={paymentMethod === 'wallet'}
                                        onChange={() => setPaymentMethod('wallet')}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">Wallet App</span>
                                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase rounded">External</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Pay via the central Wallet System</p>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                                    </div>
                                </div>

                                {paymentMethod === 'wallet' && (
                                    <div className="mt-4 ml-9 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <div className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm space-y-4">
                                            <div className="flex flex-col items-center text-center space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Instructions</div>
                                                <p className="text-xs text-slate-600">
                                                    Please complete the payment in your <span className="font-bold text-indigo-600">Wallet App</span> using the details below:
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Merchant ID</div>
                                                    <div className="text-[10px] font-mono font-bold text-slate-700 truncate">f294121c...d81a</div>
                                                </div>
                                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                                    <div className="text-[8px] font-bold text-indigo-400 uppercase mb-1">Reference ID</div>
                                                    <div className="text-sm font-mono font-black text-indigo-700">{referenceId}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                <div className="text-amber-500 mt-0.5">⚠️</div>
                                                <p className="text-[10px] text-amber-700 leading-relaxed italic">
                                                    The system will check if a transaction with this <b>Reference ID</b> exists for the merchant.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </label>

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
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {paymentMethod === 'wallet' ? 'Verifying...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        {paymentMethod === 'wallet' ? 'Confirm Payment Received' : `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}`}
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
