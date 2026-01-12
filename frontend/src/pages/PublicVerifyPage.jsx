import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Ticket, Calendar, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicVerifyPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                // Public endpoint (no auth required for simple verification)
                const res = await api.get(`/bookings/${bookingId}/verify`);
                setResult(res.data);
            } catch (error) {
                setResult({ status: 'INVALID', message: 'Ticket not found or invalid QR.' });
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [bookingId]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">Verifying Pass...</p>
        </div>
    );

    const isSuccess = result.status === 'VALID';
    const isAlreadyUsed = result.status === 'ALREADY_USED';
    const isCancelled = result.status === 'CANCELLED';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Status Banner */}
                <div className={`py-8 text-center px-6 ${isSuccess ? 'bg-emerald-500' : isAlreadyUsed ? 'bg-amber-500' : 'bg-red-500'}`}>
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                            {isSuccess ? <CheckCircle2 className="w-12 h-12 text-white" /> :
                                isAlreadyUsed ? <AlertTriangle className="w-12 h-12 text-white" /> :
                                    <XCircle className="w-12 h-12 text-white" />}
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{result.status.replace('_', ' ')}</h1>
                    <p className="text-white/80 text-sm font-semibold mt-1">{result.message}</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Event Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Ticket className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Credentials</span>
                        </div>

                        {result.eventName ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">{result.eventName}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Category</p>
                                        <p className="text-xs font-bold text-slate-700">{result.categoryName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Quantity</p>
                                        <p className="text-xs font-bold text-slate-700">{result.seats} Seats</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-white/40 uppercase">Verified Entry</p>
                                            <p className="text-xs font-bold text-white">{result.userName}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-white/30 font-mono">#{bookingId.toString().slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400 italic">
                                Information unavailable for invalid tickets.
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 italic space-y-4">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            This verification page confirms the authenticity of digital event passes issued by the EVENTBOOK Management System.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full text-xs font-bold border-slate-200"
                            onClick={() => navigate('/')}
                        >
                            Return to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicVerifyPage;
