"use client";
import React from "react";
import { motion } from "framer-motion";

const TomatoLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-24 h-24">
                {/* Shadow under the tomato */}
                <motion.div
                    animate={{ scaleX: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/10 rounded-[100%]"
                />

                {/* The Tomato */}
                <motion.svg
                    viewBox="0 0 100 100"
                    animate={{
                        y: [0, -40, 0],
                        scaleY: [1, 0.9, 1.1, 1], // Squashes on impact
                        rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-full h-full drop-shadow-xl"
                >
                    {/* Tomato Body */}
                    <circle cx="50" cy="55" r="40" fill="#FF6347" />
                    <circle cx="45" cy="50" r="38" fill="#FF4500" /> {/* Inner detail */}

                    {/* Highlight (The "Glow") */}
                    <ellipse cx="35" cy="40" rx="10" ry="5" fill="white" fillOpacity="0.3" transform="rotate(-20 35 40)" />

                    {/* Stem/Leaf */}
                    <path
                        d="M50 15 C50 15 55 25 50 35 M40 20 C40 20 45 25 50 30 M60 20 C60 20 55 25 50 30"
                        stroke="#2F4F4F"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M50 15 L45 5 L50 12 L55 5 L50 15"
                        fill="#228B22"
                    />
                </motion.svg>
            </div>

            {/* Loading Text */}
            <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-red-500 font-bold text-lg tracking-widest uppercase"
            >
                Ripening...
            </motion.p>
        </div>
    );
};

export default TomatoLoader;
