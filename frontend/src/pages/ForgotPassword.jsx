import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import axios from "axios";

import { useMessage } from "../context/MessageContext";

const publicApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Copied EyeBall component for theme consistency, simplified
const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black" }) => {
    const pupilRef = useRef(null);
    const eyeRef = useRef(null);

    useEffect(() => {
        let animationFrameId;
        const updatePosition = (event) => {
            if (!eyeRef.current || !pupilRef.current) return;
            let x = 0, y = 0;
            if (event) {
                const rect = eyeRef.current.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const centerX = rect.left + rect.width / 2;
                const deltaX = event.clientX - centerX;
                const deltaY = event.clientY - centerY;
                const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
                const angle = Math.atan2(deltaY, deltaX);
                x = Math.cos(angle) * distance; y = Math.sin(angle) * distance;
            }
            pupilRef.current.style.transform = `translate(${x}px, ${y}px)`;
        };
        const onMouseMove = (e) => {
            animationFrameId = requestAnimationFrame(() => updatePosition(e));
        };
        window.addEventListener("mousemove", onMouseMove);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [maxDistance]);

    return (
        <div ref={eyeRef} className="rounded-full flex items-center justify-center" style={{ width: size, height: size, backgroundColor: eyeColor }}>
            <div ref={pupilRef} className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor }} />
        </div>
    );
};

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showMessage } = useMessage();

    // Timer states
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();

    // Timer logic
    useEffect(() => {
        if (step === 2) {
            if (timeLeft <= 0) {
                setCanResend(true);
                return;
            }
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, step]);

    // OTP Input Handler
    const handleOtpChange = (value, index) => {
        if (/^\d?$/.test(value)) {
            const updated = [...otp];
            updated[index] = value;
            setOtp(updated);
            // Auto focus next input
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`)?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await publicApi.post('/auth/forgot-password', { email });
            showMessage("OTP sent to your email!", { type: 'success' });

            // Reset timer if re-sending
            setTimeLeft(60);
            setCanResend(false);
            setOtp(new Array(6).fill(""));
            setStep(2);
        } catch (err) {
            showMessage(err.response?.data || "Failed to send OTP", { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length < 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await publicApi.post('/auth/verify-otp', { email, otp: otpString });
            setStep(3);
        } catch (err) {
            showMessage(err.response?.data || "Invalid OTP", { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            // We need to pass the OTP here too if the backend requires it for final validation
            // The previous code passed 'otp', which was a string then. Now it's an array, so join it.
            const otpString = otp.join("");
            await publicApi.post('/auth/reset-password', { email, newPassword, otp: otpString });
            showMessage("Password reset successfully!", { type: 'success' });
            navigate('/login');
        } catch (err) {
            showMessage(err.response?.data || "Failed to reset password", { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-[420px] space-y-8 bg-card p-8 rounded-2xl shadow-sm border border-border">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="flex gap-2">
                            <EyeBall size={20} pupilSize={8} />
                            <EyeBall size={20} pupilSize={8} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {step === 1 && "Forgot password?"}
                        {step === 2 && "Enter Verification Code"}
                        {step === 3 && "Reset Password"}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {step === 1 && "No worries, we'll send you reset instructions."}
                        {step === 2 && `We've sent a 6-digit code to ${email}`}
                        {step === 3 && "Create a new strong password."}
                    </p>
                </div>

                {/* Steps */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        <Button type="submit" className="w-full h-12" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send OTP"}
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, idx) => (
                                <Input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    className="w-12 h-14 text-center text-xl font-semibold rounded-md border border-input focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                                    maxLength={1}
                                    autoComplete="off"
                                />
                            ))}
                        </div>

                        <div className="text-center">
                            {!canResend ? (
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    Resend code in <span className="font-medium text-foreground">{formatTime(timeLeft)}</span>
                                </p>
                            ) : (
                                <Button
                                    variant="ghost"
                                    onClick={(e) => handleSendOtp(e)}
                                    className="text-primary hover:text-primary/90"
                                >
                                    Resend Code
                                </Button>
                            )}
                        </div>

                        <Button onClick={handleVerifyOtp} className="w-full h-12" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
