// components/SubscriptionGuard.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Crown, Zap } from 'lucide-react';
import { getCurrentUser, User } from '@/lib/supabase';
import { PRICING_PLANS } from '@/lib/stripe';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredTier?: 'FREE' | 'PRO' | 'PREMIUM';
  fallback?: ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredTier = 'PRO',
  fallback
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const hasAccess = () => {
    if (!user) return false;
    
    const tierLevels = { FREE: 0, PRO: 1, PREMIUM: 2 };
    const userLevel = tierLevels[user.subscription_tier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 1;
    
    return userLevel >= requiredLevel && user.subscription_status === 'active';
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Login Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please log in to access this feature
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (hasAccess()) {
    return <>{children}</>;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  const getIcon = () => {
    switch (requiredTier) {
      case 'PRO':
        return <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
      case 'PREMIUM':
        return <Crown className="w-16 h-16 text-purple-500 mx-auto mb-4" />;
      default:
        return <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />;
    }
  };

  const getPlan = () => {
    return Object.values(PRICING_PLANS).find(plan => 
      plan.name.toUpperCase() === requiredTier
    );
  };

  const plan = getPlan();

  return (
    <motion.div
      className="text-center py-20 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {getIcon()}
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {requiredTier} Plan Required
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upgrade to {requiredTier} to access this premium feature and unlock the full potential of our AI tools.
        </p>

        {plan && (
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ${plan.price}<span className="text-lg text-gray-500">/month</span>
            </div>
            <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              requiredTier === 'PRO'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : requiredTier === 'PREMIUM'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Upgrade to {requiredTier}
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionGuard;