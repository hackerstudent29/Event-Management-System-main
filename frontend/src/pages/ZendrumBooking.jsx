import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfiniteGallery from "@/components/ui/infinite-gallery";
import BlurTextAnimation from "@/components/ui/blur-text-animation";

const ZendrumBooking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const descriptions = [
        {
            title: "IMAX ULTIMATE VISION",
            text: "Immerse yourself in spectacular clarity and scale on the world's most immersive screens."
        },
        {
            title: "DRIVE-IN CINEMA",
            text: "The classic experience reimagined. Enjoy your favorite blockbusters from the comfort of your own car under the stars."
        },
        {
            title: "4DX CINEMATIC FUSION",
            text: "Experience movies with all your senses. Motion, scents, and weather effects synchronized to every frame."
        },
        {
            title: "CRICKET STADIUM GRAND",
            text: "Witness the glory of the pitch under the brilliant floodlights, where legends are made and history is written."
        },
        {
            title: "FOOTBALL ARENA PASSION",
            text: "Feel the electricity of the crowd in world-class stadiums designed for the ultimate match-day atmosphere."
        }
    ];

    const galleryImages = [
        "/posters/poster_0.png",
        "/posters/poster_1.png",
        "/posters/poster_2.png",
        "/posters/poster_3.png",
        "/posters/poster_4.png"
    ];

    // Sync text with the image currently in focus
    const handleActiveImageChange = React.useCallback((index) => {
        if (index !== currentTextIndex) {
            setCurrentTextIndex(index);
        }
    }, [currentTextIndex]);

    const handleTripleClick = (e) => {
        if (e.detail === 3) {
            navigate('/');
        }
    };

    return (
        <div
            onClick={handleTripleClick}
            className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center cursor-pointer"
        >
            {/* The Infinite Gallery Component */}
            <div className="absolute inset-0 z-0">
                <InfiniteGallery
                    images={galleryImages}
                    className="h-full w-full opacity-60"
                    speed={1.2}
                    onActiveImageChange={handleActiveImageChange}
                />
            </div>

            {/* Cinematic Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
                <div className="max-w-4xl px-6 text-center">
                    <div key={currentTextIndex} className="flex flex-col items-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-blue-400 font-bold tracking-[0.5em] text-xs md:text-sm mb-4 uppercase"
                        >
                            {descriptions[currentTextIndex].title}
                        </motion.span>
                        <BlurTextAnimation
                            key={`text-${currentTextIndex}`}
                            text={descriptions[currentTextIndex].text}
                            fontSize="text-2xl md:text-3xl lg:text-4xl"
                            textColor="text-white"
                            animationDelay={5000}
                            className="!min-h-0 py-4"
                        />
                    </div>
                </div>
            </div>

            {/* Subtle Ambient Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90 pointer-events-none z-10" />

            {/* Call to Action */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 z-20"
            >
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all duration-300 hover:scale-105"
                >
                    <span className="font-semibold tracking-widest text-sm">BOOK YOUR EXPERIENCE</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    );
};

export default ZendrumBooking;
