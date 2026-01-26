import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying payment details...');

    const paymentStatus = searchParams.get('status');
    const token = searchParams.get('token');
    const referenceId = searchParams.get('ref');

    useEffect(() => {
        const verifyPayment = async () => {
            if (paymentStatus === 'success' && referenceId) {
                try {
                    // Call Backend to finalize and book
                    const response = await api.post('/payments/finalize-wallet', { referenceId: referenceId });

                    if (response.data.success) {
                        setStatus('success');
                        setMessage('Your payment was successful and your booking is confirmed!');
                    } else {
                        setStatus('error');
                        setMessage('Payment verification failed. Please check your wallet.');
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    setStatus('error');
                    setMessage(error.response?.data || 'Could not verify payment status. Please contact support.');
                }
            } else if (paymentStatus === 'success') {
                // If ref is missing but status says success (legacy/direct link?)
                setStatus('success');
                setMessage('Payment marked successful.');
            } else {
                setStatus('error');
                setMessage('Payment failed or was cancelled.');
            }
        };

        verifyPayment();
    }, [paymentStatus, token, referenceId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing...</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800" onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
                            <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/')}>Back to Home</Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800" onClick={() => navigate('/order-summary')}>Try Again</Button>
                            <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/')}>Back to Home</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
