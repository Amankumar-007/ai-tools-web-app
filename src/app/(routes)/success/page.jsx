"use client";
import { motion } from "framer-motion";

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-green-200">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-2xl shadow-xl text-center"
      >
        <h1 className="text-4xl font-extrabold text-green-700 mb-4">🎉 Payment Successful!</h1>
        <p className="text-lg text-gray-700">Thank you for your purchase. Your tomato tools are ready!</p>

        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Back to Home
        </a>
      </motion.div>
    </div>
  );
}
