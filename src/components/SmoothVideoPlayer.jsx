"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmoothVideoPlayer() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsLoaded(false); // Reset for the new video
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-[#F8FAFC] min-h-screen">
      {/* Upload Button Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Agent Manager Preview</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-md active:scale-95"
        >
          Upload Showcase Video
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="video/*" 
          className="hidden" 
        />
      </div>

      {/* Main Container mimicking your screenshot */}
      <div className="relative w-full max-w-5xl aspect-video bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <AnimatePresence mode="wait">
          {!videoSrc ? (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full text-slate-400 italic"
            >
              Upload a video to see the agent manager in action...
            </motion.div>
          ) : (
            <motion.video
              key={videoSrc}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onLoadedData={() => setIsLoaded(true)}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Optional: Subtle Overlay for the "Smooth" look */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-3xl" />
      </div>
    </div>
  );
}