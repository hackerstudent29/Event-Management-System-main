import React, { useState, useEffect } from 'react';
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";
import { Web3MediaHero } from "@/components/ui/web3media-hero";
import { AnimatePresence, motion } from "framer-motion";
import { Ticket, Music, Mic2, Star, Calendar, MapPin, Search, PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZendrumLogo } from '../components/ui/invoice';

const ZendrumBooking = () => {
    const { user } = useAuth();
    const [stage, setStage] = useState('splash'); // splash | animation | hero
    const navigate = useNavigate();
    const words = ["WELCOME", "TO", "ZENDRUM", "BOOKING"];

    useEffect(() => {
        if (stage === 'splash') {
            const timer = setTimeout(() => {
                setStage('animation');
            }, 5000); // Extended to 5 seconds
            return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleAnimationComplete = () => {
        setTimeout(() => setStage('hero'), 500);
    };

    const eventIcons = [
        {
            icon: <Ticket className="text-sky-400 w-8 h-8" />,
            label: "Tickets",
            position: { x: "12%", y: "25%" },
        },
        {
            icon: <Music className="text-sky-400 w-8 h-8" />,
            label: "Concerts",
            position: { x: "18%", y: "65%" },
        },
        {
            icon: <Mic2 className="text-sky-400 w-8 h-8" />,
            label: "Shows",
            position: { x: "82%", y: "30%" },
        },
        {
            icon: <Star className="text-sky-400 w-8 h-8" />,
            label: "VIP",
            position: { x: "78%", y: "70%" },
        },
    ];

    const partners = [
        { name: "LiveNation", logo: <span className="text-white font-bold opacity-50">LIVE NATION</span> },
        { name: "TicketMaster", logo: <span className="text-white font-bold opacity-50">TICKETMASTER</span> },
        { name: "Eventbrite", logo: <span className="text-white font-bold opacity-50">EVENTBRITE</span> },
        { name: "StubHub", logo: <span className="text-white font-bold opacity-50">STUBHUB</span> },
        { name: "VividSeats", logo: <span className="text-white font-bold opacity-50">VIVID SEATS</span> },
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <AnimatePresence>
                {/* Stage 1: Splash Logo */}
                {stage === 'splash' && (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            scale: 2,
                            filter: "blur(40px)",
                            transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }
                        }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
                    >
                        {/* Dramatic Glow Background for Logo */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <ZendrumLogo size={150} className="text-white mb-8" weight={1.5} />

                            <motion.div
                                initial={{ opacity: 0, y: 20, letterSpacing: "1em" }}
                                animate={{ opacity: 1, y: 0, letterSpacing: "0.4em" }}
                                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                                className="text-white text-4xl font-bold"
                                style={{ fontFamily: 'Righteous, sans-serif' }}
                            >
                                ZENDRUMBOOKING
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5, duration: 1 }}
                                className="mt-4 h-0.5 w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        </motion.div>
                    </motion.div>
                )}

                {/* Stage 2: Particle Animation */}
                {stage === 'animation' && (
                    <motion.div
                        key="animation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            scale: 1.2,
                            filter: "blur(20px)",
                        }}
                        transition={{
                            duration: 1.5,
                            ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                        className="fixed inset-0 z-50 pointer-events-none"
                    >
                        <ParticleTextEffect
                            words={words}
                            onComplete={handleAnimationComplete}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stage 3: Hero Layer */}
            <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'hero' ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative z-10"
            >
                <Web3MediaHero
                    logo="Zendrum Booking"
                    navigation={[]}
                    title="Experience the Next Level of"
                    highlightedText="Live Events"
                    subtitle="Secure your spot at the most anticipated music, theatre, and sports events with our lightning-fast booking engine."
                    ctaButton={{
                        label: "Browse All Events",
                        onClick: () => navigate('/')
                    }}
                    cryptoIcons={eventIcons}
                    brands={partners}
                    contactButton={!user ? {
                        label: "Sign Up Now",
                        onClick: () => navigate('/register')
                    } : undefined}
                />
            </motion.div>
        </div>
    );
};

export default ZendrumBooking;
