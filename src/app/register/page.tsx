"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/supabase";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AuthError {
  message: string;
}

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        toast.error((error as AuthError).message);
        setError((error as AuthError).message);
      } else if (data?.user) {
        toast.success("Account created successfully! Check your email for verification.");
        router.push("/ai-tools");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Google signup
  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/ai-tools`,
        },
      });

      if (error) {
        toast.error(error.message);
        setError(error.message);
        setLoading(false);
      } else {
        toast.success("Signing up with Google...");
      }
    } catch (err) {
      toast.error("Failed to sign up with Google");
      setError("Failed to sign up with Google");
      setLoading(false);
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

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 dark:bg-gray-800/90"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center tracking-tight"
        >
          Create Account
        </motion.h1>

        {/* Google Signup Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <GoogleIcon />
          Sign up with Google
        </motion.button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Create a password"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ${loading ? "opacity-80 cursor-not-allowed" : ""
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
