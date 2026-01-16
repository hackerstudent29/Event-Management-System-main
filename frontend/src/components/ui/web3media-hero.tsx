import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Ticket, Music, Mic2, Star, Calendar, MapPin } from "lucide-react";

interface CryptoIcon {
    icon: React.ReactNode;
    label: string;
    position: { x: string; y: string };
}

interface Web3MediaHeroProps {
    logo?: string;
    navigation?: Array<{
        label: string;
        onClick?: () => void;
    }>;
    contactButton?: {
        label: string;
        onClick: () => void;
    };
    title: string;
    highlightedText?: string;
    subtitle: string;
    ctaButton?: {
        label: string;
        onClick: () => void;
    };
    cryptoIcons?: CryptoIcon[];
    trustedByText?: string;
    brands?: Array<{
        name: string;
        logo: React.ReactNode;
    }>;
    className?: string;
    children?: React.ReactNode;
}

export function Web3MediaHero({
    logo = "Zendrum Booking",
    navigation = [
        { label: "Home" },
        { label: "Events" },
        { label: "Venues" },
        { label: "About" },
    ],
    contactButton,
    title,
    highlightedText = "Event Experiences",
    subtitle,
    ctaButton,
    cryptoIcons = [],
    trustedByText = "Official Partners",
    brands = [],
    className,
    children,
}: Web3MediaHeroProps) {
    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex flex-col overflow-hidden",
                className
            )}
            style={{
                background: "linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
            }}
            role="banner"
            aria-label="Hero section"
        >
            {/* Radial Glow Background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute"
                    style={{
                        width: "1200px",
                        height: "1200px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)",
                        filter: "blur(100px)",
                    }}
                />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16"
                style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        fontFamily: "Righteous, sans-serif",
                        fontSize: "22px",
                        color: "#FFFFFF",
                        letterSpacing: '0.05em'
                    }}
                >
                    ZENDRUMBOOKING
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
                    {navigation.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className="hover:text-sky-400 transition-colors"
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                color: "#FFFFFF",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Contact Button */}
                {contactButton && (
                    <button
                        onClick={contactButton.onClick}
                        className="px-6 py-2.5 rounded-full transition-all hover:bg-white hover:text-black"
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "15px",
                            fontWeight: 400,
                            color: "#FFFFFF",
                        }}
                    >
                        {contactButton.label}
                    </button>
                )}
            </motion.header>

            {/* Main Content */}
            {children ? (
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                    {children}
                </div>
            ) : (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                    {/* Floating Icons */}
                    {cryptoIcons.map((crypto, index) => (
                        <motion.div
                            key={index}
                            className="absolute flex flex-col items-center gap-2"
                            style={{
                                left: crypto.position.x,
                                top: crypto.position.y,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 0.6,
                                scale: 1,
                                y: [0, -20, 0],
                            }}
                            transition={{
                                opacity: { duration: 0.6, delay: 0.8 + index * 0.1 },
                                scale: { duration: 0.6, delay: 0.8 + index * 0.1 },
                                y: {
                                    duration: 4 + index * 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                },
                            }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center bg-sky-500/10 backdrop-blur-md border border-sky-500/30 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
                            >
                                {crypto.icon}
                            </div>
                            <span
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.5)",
                                    textTransform: "uppercase",
                                    letterSpacing: '0.1em'
                                }}
                            >
                                {crypto.label}
                            </span>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center text-center max-w-4xl"
                        style={{ gap: "32px" }}
                    >
                        {/* Logo Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            style={{
                                fontFamily: "Righteous, sans-serif",
                                fontSize: "12px",
                                fontWeight: 400,
                                color: "rgba(255, 255, 255, 0.4)",
                                letterSpacing: "0.2em",
                                textTransform: 'uppercase'
                            }}
                        >
                            The Ultimate Booking Gateway
                        </motion.div>

                        {/* Title */}
                        <h1
                            className="text-white font-medium tracing-tight"
                            style={{
                                fontFamily: "Righteous, sans-serif",
                                fontSize: "clamp(32px, 5vw, 64px)",
                                lineHeight: "1.1",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {title}
                            <br />
                            <span
                                className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 font-bold"
                            >
                                {highlightedText}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="text-slate-400 leading-relaxed max-w-md"
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "clamp(14px, 2vw, 16px)",
                            }}
                        >
                            {subtitle}
                        </p>

                        {/* CTA Button */}
                        {ctaButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={ctaButton.onClick}
                                className="px-10 py-4 rounded-xl transition-all bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-[0_0_20px_rgba(2,132,199,0.3)]"
                            >
                                {ctaButton.label}
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Brand Slider */}
            {brands.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="relative z-10 w-full overflow-hidden mt-auto"
                    style={{
                        paddingTop: "40px",
                        paddingBottom: "40px",
                    }}
                >
                    {/* "Trusted by" Text */}
                    <div className="text-center mb-8">
                        <span
                            className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-medium"
                        >
                            {trustedByText}
                        </span>
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#020617] to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#020617] to-transparent" />

                    {/* Scrolling Brands */}
                    <motion.div
                        className="flex items-center"
                        animate={{
                            x: [0, -(brands.length * 200)],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: brands.length * 5,
                                ease: "linear",
                            },
                        }}
                        style={{
                            gap: "100px",
                            paddingLeft: "100px",
                        }}
                    >
                        {[...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center justify-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                            >
                                {brand.logo}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
