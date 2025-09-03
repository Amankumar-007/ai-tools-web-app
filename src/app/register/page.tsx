"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthError {
  message: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await signUp(email, password);

    if (error) {
      setError((error as AuthError).message);
    } else if (data?.user) {
      router.push("/ai-tools");
    }
  };

  // 🍅 Generate tomato positions only once
  const tomatoPositions = useMemo(
    () =>
      [...Array(10)].map(() => ({
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
      })),
    []
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fixed blurred background (light/dark) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: "url('/generated-image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "url('/generated-image (1).png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      {/* Floating Tomatoes Background */}
      <div className="absolute inset-0 overflow-hidden">
        {tomatoPositions.map((pos, i) => (
          <motion.img
            key={i}
            src="/logo.png"
            alt="tomato"
            initial={{ y: "120vh" }}
            animate={{
              y: ["120vh", "-20vh"],
              rotate: [0, 360],
            }}
            transition={{
              duration: pos.duration,
              repeat: Infinity,
              ease: "linear",
              delay: pos.delay,
            }}
            className="absolute w-12 h-12 opacity-70"
            style={{ left: pos.left }}
          />
        ))}

        {/* Extra Tomato for Left Side */}
        <motion.img
          src="/logo.png"
          alt="tomato"
          initial={{ y: "120vh" }}
          animate={{
            y: ["120vh", "-20vh"],
            rotate: [0, 360],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-14 h-14 opacity-80 left-4 md:left-10"
        />

        {/* Extra Tomato for Mobile View */}
        <motion.img
          src="/logo.png"
          alt="tomato"
          initial={{ y: "120vh" }}
          animate={{
            y: ["120vh", "-20vh"],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-12 h-12 opacity-80 block md:hidden right-8"
        />
      </div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-sm border border-red-200"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-extrabold text-red-600 mb-8 text-center tracking-wide"
        >
          Create Account
        </motion.h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <motion.input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
              placeholder="Enter your email"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <motion.input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
              placeholder="Enter your password"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200 font-semibold shadow-md"
          >
            Sign Up
          </motion.button>
        </form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-600 hover:text-green-500 font-semibold transition duration-200"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
