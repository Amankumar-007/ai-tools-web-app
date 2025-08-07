import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const StripeNotConfigured = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
          Payment System Not Configured
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          The payment gateway is not properly configured. Please set up your environment variables to enable payments.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/PAYMENT_SETUP.md"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Setup Guide
          </Link>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Copy <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local.example</code> to <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> and fill in your values
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeNotConfigured; 