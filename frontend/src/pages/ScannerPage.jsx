import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (data) => {
        if (!data || loading) return;

        // Extract bookingId from URL: https://domain/verify/uuid
        const text = data[0]?.rawValue;
        if (!text) return;

        const parts = text.split('/');
        const bookingId = parts[parts.length - 1];

        if (!bookingId || bookingId.length < 32) return; // Basic UUID check

        setLoading(true);
        try {
            const res = await api.post('/bookings/scan', { bookingId });
            setResult(res.data);
        } catch (error) {
            setResult({ status: 'INVALID', message: 'Network error or invalid server response.' });
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
        const isCancelled = result.status === 'CANCELLED';

        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-white transition-colors duration-500
                            ${isSuccess ? 'bg-emerald-600' : isAlreadyUsed ? 'bg-amber-500' : 'bg-red-600'}`}>

                <div className="text-center space-y-6 max-w-md w-full">
                    <div className="flex justify-center">
                        {isSuccess ? <CheckCircle2 className="w-24 h-24" /> :
                            isAlreadyUsed ? <AlertTriangle className="w-24 h-24" /> :
                                <XCircle className="w-24 h-24" />}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black uppercase tracking-tight">{result.status.replace('_', ' ')}</h1>
                        <p className="text-xl font-medium opacity-90">{result.message}</p>
                    </div>

                    {result.eventName && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left border border-white/20">
                            <h2 className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Ticket Details</h2>
                            <div className="space-y-3">
                                <p className="text-lg font-bold">{result.eventName}</p>
                                <div className="flex justify-between text-sm font-semibold opacity-80">
                                    <span>{result.categoryName}</span>
                                    <span>{result.seats} Seats</span>
                                </div>
                                <p className="text-sm font-bold pt-2 border-t border-white/10">Guest: {result.userName}</p>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={resetScanner}
                        className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 text-lg font-bold rounded-xl"
                    >
                        Scan Next Ticket
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-6">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/admin')} className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold">
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Admin Scanner</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/10 relative">
                        <Scanner
                            onScan={handleScan}
                            onError={(err) => console.error(err)}
                            styles={{ container: { width: '100%', height: '100%' } }}
                        />
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                        <div className="absolute inset-[40px] border-2 border-emerald-500/50 rounded-lg pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

                            {/* Scanning line animation */}
                            <div className="w-full h-0.5 bg-emerald-500/50 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Active • Camera On</span>
                        </div>
                        <p className="text-white/40 text-sm font-medium">Position the ticket QR code in the frame to validate entry.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
