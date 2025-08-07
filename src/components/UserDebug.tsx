"use client";

import { useState, useEffect } from 'react';
import { User } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

const UserDebug = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const testPaymentWithUser = async () => {
    if (!user) {
      setTestResult('No user found');
      return;
    }

    setTestResult('Testing payment...');
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'MISSING_PRO_PRICE_ID',
          userId: user.id,
          userEmail: user.email,
        }),
      });
      
      const data = await response.json();
      console.log('User Test Response:', data);
      
      if (data.error) {
        setTestResult(`Error: ${data.error}`);
      } else if (data.url) {
        setTestResult('Success! Payment URL received');
      } else {
        setTestResult('No URL received');
      }
    } catch (error) {
      setTestResult(`Network error: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border">
        <p className="text-xs text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        User Debug Info
      </h3>
      
      {user ? (
        <div className="space-y-1 text-xs">
          <div>
            <span className="font-medium">ID:</span> {user.id}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Tier:</span> {user.subscription_tier}
          </div>
          <div>
            <span className="font-medium">Status:</span> {user.subscription_status}
          </div>
          <div>
            <span className="font-medium">Stripe Customer ID:</span> {user.stripe_customer_id || 'None'}
          </div>
          
          {/* Test Result */}
          {testResult && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Test:</span> {testResult}
            </div>
          )}
          
          {/* Test Button */}
          <button
            onClick={testPaymentWithUser}
            className="mt-2 w-full text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
          >
            Test Payment with User
          </button>
        </div>
      ) : (
        <div className="text-xs text-red-600">
          No user found. Please log in.
        </div>
      )}
      
      <button
        onClick={() => window.location.reload()}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
      >
        Refresh
      </button>
    </div>
  );
};

export default UserDebug; 