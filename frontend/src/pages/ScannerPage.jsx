// Redeploy Trigger: Premium Scanner UI Update
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    console.log('Premium Scanner v1.0.2 Loaded');
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (data) => {
        if (!data || loading || result) return;

        const text = data[0]?.rawValue;
        if (!text) return;

        let bookingId;
        if (text.startsWith('BOOKING-')) {
            const parts = text.split('-');
            if (parts.length >= 6) {
                bookingId = parts.slice(1, 6).join('-');
            }
        } else if (text.includes('/')) {
            const parts = text.split('/');
            bookingId = parts[parts.length - 1];
        } else {
            bookingId = text;
        }

        if (!bookingId || bookingId.length < 32) return;

        setLoading(true);
        try {
            const res = await api.post('/bookings/scan', { bookingId });
            setResult(res.data);
        } catch (error) {
            setResult({ status: 'INVALID', message: error.response?.data?.message || 'Network error or invalid server response.' });
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setResult(null);
    };

    if (result) {
        const isSuccess = result.status === 'VALID';
        const isAlreadyUsed = result.status === 'ALREADY_USED';
        const isInvalid = result.status === 'INVALID' || result.status === 'CANCELLED';

        const bgColor = isSuccess ? 'bg-emerald-600' : isAlreadyUsed ? 'bg-amber-500' : 'bg-red-600';

        return (
            <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-6 text-white transition-colors duration-700 ease-in-out`}>
                <div className="text-center space-y-8 max-w-md w-full animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center scale-110">
                        {isSuccess ? <CheckCircle2 className="w-24 h-24 stroke-[1.5]" /> :
                            isAlreadyUsed ? <AlertTriangle className="w-24 h-24 stroke-[1.5]" /> :
                                <XCircle className="w-24 h-24 stroke-[1.5]" />}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic">{result.status.replace('_', ' ')}</h1>
                        <p className="text-lg font-medium opacity-80 max-w-[280px] mx-auto">{result.message}</p>
                    </div>

                    {result.eventName && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-left border border-white/20 shadow-2xl relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                            <div className="relative space-y-6">
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-2">Event Header</h2>
                                    <p className="text-2xl font-bold leading-none mb-2">{result.eventName}</p>
                                    <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                                        <MapPin className="w-4 h-4 text-white/60" />
                                        <span>{result.locationName}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Date & Time</p>
                                        <p className="text-sm font-bold">{result.eventDate}</p>
                                        <p className="text-xs font-semibold opacity-60 italic">{result.eventTime}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Category/Seats</p>
                                        <p className="text-sm font-bold">{result.categoryName}</p>
                                        <p className="text-xs font-semibold opacity-60">{result.seats} Person(s)</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Seat Assignment</p>
                                    <p className="text-4xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(252,211,77,0.3)] tracking-tighter uppercase">
                                        {result.seatIdentifiers || `Generic x${result.seats}`}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                                            {result.userName ? (
                                                <span className="font-bold text-sm tracking-tighter">{result.userName.split(' ').map(n => n[0]).join('')}</span>
                                            ) : (
                                                <User className="w-5 h-5 opacity-60" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Guest Name</p>
                                            <p className="text-sm font-bold">{result.userName || 'Unknown Guest'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Verification</p>
                                        <p className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-tighter">Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={resetScanner}
                        className="w-full h-16 bg-white text-slate-900 hover:bg-slate-50 active:scale-[0.98] transition-all text-xl font-black rounded-2xl shadow-xl uppercase tracking-widest"
                    >
                        Scan Next Ticket
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-6 overflow-hidden">
            <style>
                {`
                @keyframes scanLine {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scanLine 3s linear infinite;
                }
                `}
            </style>

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                <div className="flex items-center justify-between mt-4 mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white/40 hover:text-white transition-colors flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 active:scale-95 duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">Return</span>
                    </button>
                    <span className="text-xs font-black text-white px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md uppercase tracking-[0.4em] translate-x-3">Admin Scanner</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black">
                        <Scanner
                            onScan={handleScan}
                            onError={(err) => console.error(err)}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover' }
                            }}
                        />

                        {/* Aperture Mask */}
                        <div className="absolute inset-0 border-[3rem] border-black/60 pointer-events-none" />

                        {/* Scanning Brackets and Line */}
                        <div className="absolute inset-[3rem] pointer-events-none">
                            <div className="absolute -inset-1 border border-white/5 rounded-2xl" />

                            {/* Glowing Corners */}
                            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl shadow-[-5px_-5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl shadow-[5px_-5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl shadow-[-5px_5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl shadow-[5px_5px_15px_rgba(16,185,129,0.4)]" />

                            {/* Center Scanning Line */}
                            <div className="w-full h-1 bg-emerald-400 absolute animate-scan shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500 absolute inset-0 animate-ping" />
                            </div>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] pt-0.5">Active • Camera On</span>
                        </div>
                        <div className="max-w-[240px] mx-auto">
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                System ready for validation. <br />
                                <span className="text-white/20">Position QR inside brackets.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Bottom Guard */}
                <div className="h-2 w-1/3 bg-white/5 mx-auto rounded-full mb-2 opacity-50" />
            </div>
        </div>
    );
};

export default ScannerPage;
