import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useMessage } from "../context/MessageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";


const Pupil = ({
    size = 12,
    maxDistance = 5,
    pupilColor = "black",
    forceLookX,
    forceLookY
}) => {
    const pupilRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const updatePosition = (event) => {
            if (!pupilRef.current) return;

            let x = 0, y = 0;

            if (forceLookX !== undefined && forceLookY !== undefined) {
                x = forceLookX;
                y = forceLookY;
            } else if (event) {
                const rect = pupilRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = event.clientX - centerX;
                const deltaY = event.clientY - centerY;
                const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
                const angle = Math.atan2(deltaY, deltaX);
                x = Math.cos(angle) * distance;
                y = Math.sin(angle) * distance;
            }

            pupilRef.current.style.transform = `translate(${x}px, ${y}px)`;
        };

        const onMouseMove = (e) => {
            animationFrameId = requestAnimationFrame(() => updatePosition(e));
        };

        // Initial update if forced
        if (forceLookX !== undefined) updatePosition(null);

        window.addEventListener("mousemove", onMouseMove);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [forceLookX, forceLookY, maxDistance]);

    return (
        <div
            ref={pupilRef}
            className="rounded-full"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pupilColor,
                transition: 'transform 0.1s ease-out',
            }}
        />
    );
};

const EyeBall = ({
    size = 48,
    pupilSize = 16,
    maxDistance = 10,
    eyeColor = "white",
    pupilColor = "black",
    isBlinking = false,
    forceLookX,
    forceLookY
}) => {
    const pupilRef = useRef(null);
    const eyeRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const updatePosition = (event) => {
            if (!eyeRef.current || !pupilRef.current) return;

            let x = 0, y = 0;

            if (forceLookX !== undefined && forceLookY !== undefined) {
                x = forceLookX;
                y = forceLookY;
            } else if (event) {
                const rect = eyeRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = event.clientX - centerX;
                const deltaY = event.clientY - centerY;
                const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
                const angle = Math.atan2(deltaY, deltaX);
                x = Math.cos(angle) * distance;
                y = Math.sin(angle) * distance;
            }
            pupilRef.current.style.transform = `translate(${x}px, ${y}px)`;
        };

        const onMouseMove = (e) => {
            animationFrameId = requestAnimationFrame(() => updatePosition(e));
        };

        // Initial update
        if (forceLookX !== undefined) updatePosition(null);

        window.addEventListener("mousemove", onMouseMove);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [forceLookX, forceLookY, maxDistance]);

    return (
        <div
            ref={eyeRef}
            className="rounded-full flex items-center justify-center transition-all duration-150"
            style={{
                width: `${size}px`,
                height: isBlinking ? '2px' : `${size}px`,
                backgroundColor: eyeColor,
                overflow: 'hidden',
            }}
        >
            {!isBlinking && (
                <div
                    ref={pupilRef}
                    className="rounded-full"
                    style={{
                        width: `${pupilSize}px`,
                        height: `${pupilSize}px`,
                        backgroundColor: pupilColor,
                        transition: 'transform 0.1s ease-out',
                    }}
                />
            )}
        </div>
    );
};

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { showMessage } = useMessage();
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);

    const purpleRef = useRef(null);
    const blackRef = useRef(null);
    const yellowRef = useRef(null);
    const orangeRef = useRef(null);

    const { login, googleLogin: googleLoginContext } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => {
                    setIsPurpleBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => {
                    setIsBlackBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => {
                setIsLookingAtEachOther(false);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    useEffect(() => {
        if (password.length > 0 && showPassword) {
            const schedulePeek = () => {
                const peekInterval = setTimeout(() => {
                    setIsPurplePeeking(true);
                    setTimeout(() => {
                        setIsPurplePeeking(false);
                    }, 800);
                }, Math.random() * 3000 + 2000);
                return peekInterval;
            };

            const firstPeek = schedulePeek();
            return () => clearTimeout(firstPeek);
        } else {
            setIsPurplePeeking(false);
        }
    }, [password, showPassword, isPurplePeeking]);

    const calculatePosition = (ref) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodyRotation: 0 };

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const faceX = Math.max(-15, Math.min(15, deltaX / 20));
        const faceY = Math.max(-10, Math.min(10, deltaY / 30));

        const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

        return { faceX, faceY, bodySkew };
    };

    const purplePos = calculatePosition(purpleRef);
    const blackPos = calculatePosition(blackRef);
    const yellowPos = calculatePosition(yellowRef);
    const orangePos = calculatePosition(orangeRef);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            showMessage(err.response?.data?.message || err.message || "Login failed!", { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const googleLoginAction = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                await googleLoginContext(tokenResponse.access_token);
                navigate('/');
            } catch (err) {
                showMessage("Google login failed!", { type: 'error' });
            }
            setLoading(false);
        },
        onError: () => {
            showMessage("Google login failed!", { type: 'error' });
        },
    });

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Content Section */}
            <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>EventBooking</span>
                    </div>
                </div>

                <div className="relative z-20 flex items-end justify-center h-[500px]">
                    {/* Cartoon Characters */}
                    <div className="relative" style={{ width: '550px', height: '400px' }}>
                        {/* Purple tall rectangle character - Back layer */}
                        <div
                            ref={purpleRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '70px',
                                width: '180px',
                                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                                backgroundColor: '#6C3FF5',
                                borderRadius: '10px 10px 0 0',
                                zIndex: 1,
                                transform: (password.length > 0 && showPassword)
                                    ? `skewX(0deg)`
                                    : (isTyping || (password.length > 0 && !showPassword))
                                        ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                                        : `skewX(${purplePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            {/* Eyes */}
                            <div
                                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                                    top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Black tall rectangle character - Middle layer */}
                        <div
                            ref={blackRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '240px',
                                width: '120px',
                                height: '310px',
                                backgroundColor: '#2D2D2D',
                                borderRadius: '8px 8px 0 0',
                                zIndex: 2,
                                transform: (password.length > 0 && showPassword)
                                    ? `skewX(0deg)`
                                    : isLookingAtEachOther
                                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                                        : (isTyping || (password.length > 0 && !showPassword))
                                            ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                                            : `skewX(${blackPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            {/* Eyes */}
                            <div
                                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                                    top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Orange semi-circle character - Front left */}
                        <div
                            ref={orangeRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '0px',
                                width: '240px',
                                height: '200px',
                                zIndex: 3,
                                backgroundColor: '#FF9B6B',
                                borderRadius: '120px 120px 0 0',
                                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            {/* Eyes - just pupils, no white */}
                            <div
                                className="absolute flex gap-8 transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                        </div>

                        {/* Yellow tall rectangle character - Front right */}
                        <div
                            ref={yellowRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '310px',
                                width: '140px',
                                height: '230px',
                                backgroundColor: '#E8D754',
                                borderRadius: '70px 70px 0 0',
                                zIndex: 4,
                                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            {/* Eyes - just pupils, no white */}
                            <div
                                className="absolute flex gap-6 transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                            {/* Horizontal line for mouth */}
                            <div
                                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative z-20 flex flex-col gap-1 text-sm text-primary-foreground/80">
                    <p className="font-semibold">Event Booking Management System</p>
                    <p className="text-primary-foreground/60">Secure and real-time event seat booking platform.</p>
                    <p className="mt-2 text-xs text-primary-foreground/50">Contact: <a href="mailto:support@eventbooking.com" className="hover:text-primary-foreground transition-colors">support@eventbooking.com</a></p>
                </div>

                {/* Decorative elements */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
            </div>

            {/* Right Login Section */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-4 text-primary" />
                        </div>
                        <span>EventBooking</span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
                        <p className="text-muted-foreground text-sm">Please enter your details</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                autoComplete="one-time-code"
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                                className="h-12 bg-background border-border/60 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5" />
                                    ) : (
                                        <Eye className="size-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Remember for 30 days
                                </Label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Log in"}
                        </Button>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6 flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full h-12"
                            onClick={() => googleLoginAction()}
                        >
                            <svg className="mr-3 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Login with Google
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm text-muted-foreground mt-8">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-foreground font-medium hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
