import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sparkles, Mail, Lock } from "lucide-react";
import api from '../api/axios';
import { useMessage } from "../context/MessageContext";

export default function VerifySignupOtp() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(state?.email || "");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showMessage } = useMessage();

    useEffect(() => {
        if (!state?.email) {
            // If accessed directly without state, maybe redirect to login or ask for email
        }
    }, [state]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/verify-email', { email, otp });
            showMessage("Email verified successfully! You can now log in.", { type: 'success' });
            navigate('/login');
        } catch (err) {
            showMessage(err.response?.data || "Verification failed. Invalid or expired OTP.", { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4">
                        <Mail className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
                    <p className="text-sm text-muted-foreground">
                        We've sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="h-12 text-center text-lg tracking-[0.5em] font-mono"
                            maxLength={6}
                            required
                        />
                    </div>



                    <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading || otp.length < 6}>
                        {isLoading ? "Verifying..." : "Verify & Activate Account"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Didn't receive the code? {" "}
                        <button className="text-primary font-medium hover:underline disabled:opacity-50">Resend</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
