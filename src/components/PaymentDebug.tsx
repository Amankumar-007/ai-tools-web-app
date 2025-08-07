"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const PaymentDebug = () => {
  const [configStatus, setConfigStatus] = useState<{
    stripe: boolean;
    priceIds: boolean;
    message: string;
    details: string;
  }>({
    stripe: false,
    priceIds: false,
    message: 'Checking configuration...',
    details: ''
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            priceId: 'MISSING_PRO_PRICE_ID', 
            userId: 'test-user-id',
            userEmail: 'test@example.com'
          }),
        });
        
        const data = await response.json();
        console.log('Debug API Response:', data);
        
        if (data.error) {
          if (data.error.includes('not configured')) {
            setConfigStatus({ 
              stripe: false, 
              priceIds: false, 
              message: 'Stripe is not configured',
              details: 'Missing environment variables'
            });
          } else if (data.error.includes('MISSING_PRO_PRICE_ID')) {
            setConfigStatus({ 
              stripe: true, 
              priceIds: false, 
              message: 'Price IDs are missing',
              details: 'Stripe is configured but price IDs are not set'
            });
          } else if (data.error.includes('No such price')) {
            setConfigStatus({ 
              stripe: true, 
              priceIds: false, 
              message: 'Invalid price IDs',
              details: 'Price IDs are set but invalid'
            });
          } else {
            setConfigStatus({ 
              stripe: true, 
              priceIds: true, 
              message: 'Configuration looks good!',
              details: 'API is responding correctly'
            });
          }
        } else {
          setConfigStatus({ 
            stripe: true, 
            priceIds: true, 
            message: 'Configuration looks good!',
            details: 'API returned success response'
          });
        }
      } catch (error) {
        console.error('Debug API Error:', error);
        setConfigStatus({ 
          stripe: false, 
          priceIds: false, 
          message: 'Network error',
          details: 'Cannot connect to API endpoint'
        });
      }
    };
    checkConfig();
  }, []);

  const testPaymentFlow = async () => {
    setTestResult({ success: false, message: 'Testing payment flow...' });
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: 'MISSING_PRO_PRICE_ID', 
          userId: 'test-user-id',
          userEmail: 'test@example.com'
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        setTestResult({ 
          success: true, 
          message: 'Payment flow works!', 
          url: data.url 
        });
      } else if (data.error) {
        setTestResult({ 
          success: false, 
          message: `Error: ${data.error}` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'No URL received' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Network error: ${error}` 
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Payment Debug
      </h3>
      
      {/* Configuration Status */}
      <div className="mb-3">
        <div className="flex items-center mb-1">
          {configStatus.stripe ? (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className="text-xs font-medium">Stripe API</span>
        </div>
        
        <div className="flex items-center mb-1">
          {configStatus.priceIds ? (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className="text-xs font-medium">Price IDs</span>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {configStatus.message}
        </p>
        
        {configStatus.details && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {configStatus.details}
          </p>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="flex items-center mb-1">
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 mr-2" />
            )}
            <span className="text-xs font-medium">Test Result</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {testResult.message}
          </p>
          {testResult.url && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              URL: {testResult.url.substring(0, 30)}...
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={testPaymentFlow}
          className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Test Payment Flow
        </button>
        
        {!configStatus.stripe && (
          <div className="text-xs">
            <Link 
              href="/STRIPE_SETUP.md" 
              className="text-blue-600 hover:text-blue-800 underline flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Setup Guide
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDebug; 