"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const THEME_COLOR = "#1a3a3a"; // The deep green color

export default function BookModalPlain() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center rounded-lg justify-center min-h-screen bg-[#f5f5f5] p-4 font-sans">
            {/* TRIGGER BUTTON */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative px-10 py-4 text-white transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(26,58,58,0.3)] hover:-translate-y-1"
                style={{ backgroundColor: THEME_COLOR }}
            >
                <span className="text-sm font-medium tracking-[0.2em] uppercase">
                    Open Book Form
                </span>
            </button>

            {/* MODAL OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-[#e5e5e5]/90 backdrop-blur-sm"
                        />

                        {/* MODAL CONTENT */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative w-full max-w-md bg-white p-10 shadow-[0px_20px_40px_-10px_rgba(26,58,58,0.2)]"
                        >
                            {/* HEADER - Very Plain */}
                            <div className="flex items-center justify-between mb-10">
                                <h2
                                    className="text-2xl font-light tracking-wide"
                                    style={{ color: THEME_COLOR }}
                                >
                                    New Entry
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="opacity-50 hover:opacity-100 transition-opacity"
                                    style={{ color: THEME_COLOR }}
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* FORM */}
                            <form className="space-y-8">
                                {/* INTERACTIVE INPUTS */}
                                <GhostInput label="Your Name" />
                                <GhostInput label="Email Address" type="email" />
                                <GhostInput label="Author Name" />
                                <GhostInput label="Book Title" />

                                {/* SUBMIT BUTTON */}
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 text-sm tracking-widest uppercase text-white transition-all duration-300 hover:opacity-90"
                                        style={{ backgroundColor: THEME_COLOR }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// THE "GHOST" INPUT COMPONENT
// The label is hidden (opacity-0) until you hover the container
function GhostInput({ label, type = "text" }: { label: string; type?: string }) {
    return (
        <div className="group relative w-full">
            {/* The Label - Appears on Hover */}
            <label
                className="absolute -top-5 left-0 text-xs font-semibold uppercase tracking-wider transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                style={{ color: THEME_COLOR }}
            >
                {label}
            </label>

            {/* The Input - A simple line that thickens on focus */}
            <input
                type={type}
                placeholder={label} // Placeholder acts as the initial label
                className="w-full bg-transparent py-2 text-lg outline-none transition-all duration-300 border-b border-gray-200 placeholder:text-gray-300 placeholder:font-light hover:border-opacity-50 focus:border-b-2 placeholder:transition-opacity group-hover:placeholder:opacity-0 group-focus-within:placeholder:opacity-0"
                style={{
                    borderColor: "rgba(26, 58, 58, 0.2)", // Light version of theme color
                    color: THEME_COLOR,
                }}
                // Inline style for focus color to use the dynamic theme variable
                onFocus={(e) => e.currentTarget.style.borderColor = THEME_COLOR}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(26, 58, 58, 0.2)"}
            />
        </div>
    );
}