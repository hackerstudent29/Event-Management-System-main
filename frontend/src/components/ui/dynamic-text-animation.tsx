"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DynamicTextAnimationProps {
    text: string;
    type: "blur" | "slide" | "zoom" | "glitch" | "wave";
    fontSize?: string;
    textColor?: string;
    className?: string;
}

const DynamicTextAnimation: React.FC<DynamicTextAnimationProps> = ({
    text,
    type,
    fontSize = "text-2xl md:text-3xl lg:text-4xl",
    textColor = "text-white",
    className = ""
}) => {
    const words = text.split(" ");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            }
        }
    };

    const getWordVariants = () => {
        switch (type) {
            case "blur":
                return {
                    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
                    visible: {
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        transition: { duration: 0.8, ease: "easeOut" }
                    },
                    exit: {
                        opacity: 0,
                        filter: "blur(10px)",
                        y: -20,
                        transition: { duration: 0.5 }
                    }
                };
            case "slide":
                return {
                    hidden: { opacity: 0, x: -30 },
                    visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.6, type: "spring", stiffness: 100 }
                    },
                    exit: {
                        opacity: 0,
                        x: 30,
                        transition: { duration: 0.4 }
                    }
                };
            case "zoom":
                return {
                    hidden: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
                    visible: {
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                        transition: { duration: 0.7, ease: "backOut" }
                    },
                    exit: {
                        opacity: 0,
                        scale: 1.5,
                        transition: { duration: 0.5 }
                    }
                };
            case "glitch":
                return {
                    hidden: { opacity: 0, skew: "20deg" },
                    visible: {
                        opacity: 1,
                        skew: "0deg",
                        transition: {
                            duration: 0.3,
                            repeat: 1,
                            repeatType: "reverse" as const,
                        }
                    },
                    exit: { opacity: 0 }
                };
            case "wave":
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            type: "spring",
                            damping: 12,
                            stiffness: 100
                        }
                    },
                    exit: {
                        opacity: 0,
                        y: -50,
                        transition: { duration: 0.3 }
                    }
                };
            default:
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                    exit: { opacity: 0 }
                };
        }
    };

    const wordVariants = getWordVariants();

    return (
        <div className={`flex flex-wrap justify-center overflow-hidden ${className}`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-wrap justify-center"
            >
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        variants={wordVariants}
                        className={`inline-block mr-[0.3em] ${fontSize} ${textColor} font-light tracking-wide`}
                        style={{ display: "inline-block" }}
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
};

export default DynamicTextAnimation;
