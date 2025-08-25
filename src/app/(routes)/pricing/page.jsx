"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (amount) => {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error: " + data.error);
    }
    setLoading(false);
  };

  const plans = [
    { name: "Basic", price: 1000, text: "$10 one-time", gradient: "from-red-400 to-red-600" },
    { name: "Pro", price: 2000, text: "$20 one-time", gradient: "from-orange-400 to-red-500" },
    { name: "Premium", price: 5000, text: "$50 one-time", gradient: "from-yellow-400 to-red-500" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-100 to-red-200 dark:from-gray-900 dark:to-black p-8 transition-colors duration-500">
      {/* Floating Tomato Left */}
      <motion.div
        initial={{ y: -30 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-24 h-24 opacity-70"
      >
        <Image src="/logo.png" alt="tomato" width={100} height={100} />
      </motion.div>

      {/* Floating Tomato Right */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 w-28 h-28 opacity-70"
      >
        <Image src="/logo.png" alt="tomato" width={120} height={120} />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-red-700 dark:text-red-400 mb-12"
      >
         Premium Tomato Plans
      </motion.h1>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className="rounded-2xl shadow-2xl bg-white dark:bg-gray-800 text-center p-10 border-2 border-transparent hover:border-red-400 dark:hover:border-red-500 hover:scale-105 transition-all duration-300"
          >
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">{plan.name}</h2>
            <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">{plan.text}</p>

            <div className={`mt-6 bg-gradient-to-r ${plan.gradient} text-white py-3 px-6 rounded-xl shadow-md`}>
              <button
                onClick={() => handleCheckout(plan.price)}
                disabled={loading}
                className="font-semibold tracking-wide w-full"
              >
                {loading ? "Loading..." : "Buy Now"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
