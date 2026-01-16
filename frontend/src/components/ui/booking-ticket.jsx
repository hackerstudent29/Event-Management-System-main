import React from 'react';
import { ZendrumLogo } from './invoice';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, User, CheckCircle2, ShieldCheck, Ticket, Bookmark, Info } from 'lucide-react';

export const BookingTicket = ({ bookingData = {} }) => {
    const {
        bookingId = 'WFBHGFL',
        eventName = 'Event Name',
        eventImage = '',
        eventDate = 'Fri, 15 Aug 2025',
        eventTime = '06:00 PM',
        venueName = 'Main Arena',
        city = 'Chennai',
        categoryName = 'PREMIUM',
        seats = 'M9',
        seatsBooked = 1,
        ticketSubtotal = 0,
        convenienceFee = 0,
        gstAmount = 0,
        totalAmount = 0,
        bookingDateTime = '',
        paymentMode = 'UPI',
        transactionId = '',
        qrValue = 'WFBHGFL'
    } = bookingData;

    const fallbackImage = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=800&h=300";

    return (
        <div className="bg-white mx-auto shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden font-sans border border-slate-100 mb-10" style={{ maxWidth: '480px' }}>

            {/* 1. Header Hero Pass */}
            <div className="relative bg-slate-950 text-white p-8 overflow-hidden">
                {/* Visual Accent: Abstract Glass Orb */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-600/20 blur-[100px] rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

                <div className="relative z-10 space-y-8">
                    {/* Brand & ID */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white p-1 rounded-lg">
                                <ZendrumLogo size={20} className="text-slate-950" />
                            </div>
                            <span className="text-sm font-medium tracking-[0.2em] uppercase opacity-70">Zendrum Pass</span>
                        </div>
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                            <span className="text-[10px] font-mono font-medium tracking-tight">#{bookingId}</span>
                        </div>
                    </div>

                    {/* QR Windows (Aesthetically integrated) */}
                    <div className="flex justify-center py-4">
                        <div className="relative group">
                            {/* Scanning Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500/20 to-blue-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative p-6 bg-white rounded-3xl shadow-2xl">
                                <QRCodeSVG
                                    value={qrValue}
                                    size={180}
                                    level="L"
                                    includeMargin={false}
                                    fgColor="#0f172a"
                                />
                                {/* Micro Security Pattern */}
                                <div className="absolute top-2 left-2 flex gap-1 opacity-20">
                                    <ShieldCheck className="w-3 h-3 text-slate-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event Primary Info */}
                    <div className="text-center space-y-1 pt-2">
                        <h3 className="text-3xl font-semibold tracking-tight leading-tight">
                            {eventName}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                            <MapPin className="w-3 h-3" />
                            <span>{venueName}, {city}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Pass Details Grid */}
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Date & Time</span>
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-100 p-2 rounded-xl">
                                <Calendar className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{eventDate} • {eventTime}</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Section</span>
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-100 p-2 rounded-xl">
                                <Bookmark className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{categoryName}</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Seats</span>
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-100 p-2 rounded-xl">
                                <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{seats || seatsBooked + ' Ticket(s)'}</span>
                        </div>
                    </div>
                </div>

                {/* Event Image Banner (Subtle) */}
                <div className="relative h-20 w-full rounded-2xl overflow-hidden ring-1 ring-slate-100 shadow-sm">
                    <img src={eventImage || fallbackImage} className="w-full h-full object-cover opacity-80" alt="" />
                    <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />
                </div>

                {/* Verification Status Pill */}
                <div className="flex items-center justify-center py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-100 gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Valid & Ready for Entry</span>
                </div>

                {/* Secondary Info Section */}
                <div className="pt-8 border-t border-slate-100 space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h4 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Total Valuated</h4>
                            <p className="text-2xl font-semibold text-slate-900 leading-none">
                                ₹{totalAmount.toFixed(0)} <span className="text-xs font-normal text-slate-400">Paid via {paymentMode}</span>
                            </p>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-slate-200" strokeWidth={1.5} />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-slate-700">Admission Guidelines</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Present this digital pass at the checkpoint. Avoid using screenshots. Screen brightness must be set to 100% for efficient scanning.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: auto; margin: 0; }
                    body { background: white !important; }
                    .rounded-[2.5rem] { border-radius: 0 !important; }
                    .shadow-\[0_35px_60px_-15px_rgba\(0\,0\,0\,0\.1\)\] { box-shadow: none !important; }
                    .bg-slate-950 { background-color: #020617 !important; -webkit-print-color-adjust: exact; }
                }
            ` }} />
        </div>
    );
};
