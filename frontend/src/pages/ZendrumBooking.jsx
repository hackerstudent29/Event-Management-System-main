import React from 'react';
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfiniteGallery from "@/components/ui/infinite-gallery";

const ZendrumBooking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const galleryImages = [
        "/posters/poster_0.png",
        "/posters/poster_1.png",
        "/posters/poster_2.png",
        "/posters/poster_3.png",
        "/posters/poster_4.png"
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center">
            {/* The Infinite Gallery Component */}
            <div className="absolute inset-0">
                <InfiniteGallery
                    images={galleryImages}
                    className="h-full w-full opacity-90"
                    speed={0.8}
                />
            </div>

            {/* Subtle Ambient Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
        </div>
    );
};

export default ZendrumBooking;
