"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.push("/tomato-ai");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/tomato-ai`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to sign in with Google");
      setLoading(false);
    }
  };

  // ✅ Generate tomato positions once (not every render)
  const tomatoPositions = useMemo(
    () =>
      [...Array(10)].map(() => ({
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
      })),
    []
  );

  // Google SVG Icon Component
  const GoogleIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
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

      {/* Login Card */}
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
           Welcome Back!
        </motion.h1>

        {/* Google Login Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
              disabled={loading}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-green-600 hover:text-green-500 font-semibold transition duration-200"
          >
            Register
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
