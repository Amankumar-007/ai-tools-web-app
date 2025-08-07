"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

const SuccessPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            className="text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Thank you for subscribing! Your premium features are now active. You can start exploring all the AI tools available in your plan.
          </motion.p>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/ai-tools"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              Explore AI Tools
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </motion.div>

          {sessionId && (
            <motion.p
              className="text-xs text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Session ID: {sessionId}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Need help? <Link href="/support" className="text-blue-500 hover:text-blue-600">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessPage;