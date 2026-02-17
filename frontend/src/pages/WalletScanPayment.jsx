import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, CreditCard, ShieldCheck, Zap } from "lucide-react";

const WalletScanPayment = () => {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token');
    const navigate = useNavigate();

    const [token, setToken] = useState(tokenFromUrl);
    const [loading, setLoading] = useState(!!tokenFromUrl);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const WALLET_API_URL = 'https://payment-gateway-production-2f82.up.railway.app';

    useEffect(() => {
        if (token) {
            fetchDetails(token);
        }
    }, [token]);

    const fetchDetails = async (paymentToken) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${WALLET_API_URL}/api/v1/payments/${paymentToken}`);
            setPaymentDetails(res.data);
        } catch (err) {
            console.error(err);
            setError("Link expired or invalid payment details.");
            setToken(null); // Reset to scanner on error
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            await axios.post(`${WALLET_API_URL}/api/v1/payments/${token}/confirm`);
            setPaymentSuccess(true);

            setTimeout(() => {
                if (paymentDetails?.reference) {
                    window.location.href = `/payment-success?ref=${paymentDetails.reference}&status=success`;
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Payment failed. Please check your balance.");
            setProcessing(false);
        }
    };

    const handleCameraScan = (data) => {
        if (!data || loading) return;
        const scannedText = data[0]?.rawValue;
        if (!scannedText) return;

        // Extract token from URL if the QR contains a full link
        // format: https://domain.com/scan?token=XYZ
        try {
            const url = new URL(scannedText);
            const scannedToken = url.searchParams.get('token');
            if (scannedToken) {
                setToken(scannedToken);
            } else {
                setToken(scannedText); // Assume raw token
            }
        } catch (e) {
            setToken(scannedText); // Fallback to raw text
        }
    };

    // --- RENDER LOGIC ---

    // 1. Loading State
    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-emerald-500">
            <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] opacity-60">Initializing Secure Link...</p>
        </div>
    );

    // 2. Success State (Animated Transition)
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white transition-all duration-700 animate-in fade-in">
                <div className="text-center space-y-6">
                    <CheckCircle2 className="w-24 h-24 mx-auto stroke-[1.5] animate-bounce" />
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Payment Successful</h1>
                    <p className="text-lg font-medium opacity-80">Transaction complete. Redirecting...</p>
                </div>
            </div>
        );
    }

    // 3. Payment Confirmation Mode (If Token Exists)
    if (token && paymentDetails) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col p-6 font-sans overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />

                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        {/* Brackets */}
                        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-xl" />
                        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/40 rounded-br-xl" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Merchant</span>
                                </div>
                                <h1 className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Payment Request</h1>
                                <p className="text-2xl font-bold mt-2 text-white">Event Booking System</p>
                            </div>

                            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 text-center transition-transform hover:scale-[1.02] duration-300">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                    <Zap className="w-3 h-3 fill-emerald-500" /> Total Payable
                                </p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-2xl font-black text-white/40">{paymentDetails.currency}</span>
                                    <span className="text-6xl font-black text-white tracking-tighter">
                                        {paymentDetails.amount?.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs font-mono text-white/20 mt-4 tracking-widest">{paymentDetails.reference}</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    onClick={handleConfirm}
                                    disabled={processing}
                                    className="w-full h-16 bg-white text-slate-900 hover:bg-slate-50 active:scale-95 transition-all rounded-2xl text-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : "Confirm Payment"}
                                </Button>
                                <button
                                    onClick={() => setToken(null)}
                                    className="w-full mt-6 text-white/20 hover:text-white/40 text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Scanner Mode (Default)
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
                .animate-scan { animation: scanLine 3s linear infinite; }
                `}
            </style>

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                <div className="flex items-center justify-between mt-4 mb-12">
                    <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold">Back</span>
                    </button>
                    <span className="text-xs font-black text-white px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md uppercase tracking-[0.4em]">Wallet Scan</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-white/10 relative bg-black shadow-2xl">
                        <Scanner
                            onScan={handleCameraScan}
                            onError={(err) => console.error(err)}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover' }
                            }}
                        />
                        <div className="absolute inset-0 border-[3.5rem] border-black/60 pointer-events-none" />

                        <div className="absolute inset-[3.5rem] pointer-events-none">
                            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl shadow-[-5px_-5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl shadow-[5px_-5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl shadow-[-5px_5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl shadow-[5px_5px_15px_rgba(16,185,129,0.4)]" />
                            <div className="w-full h-1 bg-emerald-400 absolute animate-scan shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest pt-0.5">Secure Wallet Live</span>
                        </div>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Scan Merchant QR code <br /> to pay instantly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletScanPayment;
