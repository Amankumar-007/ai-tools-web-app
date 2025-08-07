"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const EnvironmentDebug = () => {
  const [envStatus, setEnvStatus] = useState<{
    stripePublishable: boolean;
    stripeSecret: boolean;
    webhookSecret: boolean;
    supabaseUrl: boolean;
    supabaseAnon: boolean;
    details: string[];
  }>({
    stripePublishable: false,
    stripeSecret: false,
    webhookSecret: false,
    supabaseUrl: false,
    supabaseAnon: false,
    details: []
  });

  useEffect(() => {
    const checkEnvironment = async () => {
      const details: string[] = [];
      
      try {
        // Test API endpoint to see what environment variables are actually loaded
        const response = await fetch('/api/debug-env', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Environment Debug Data:', data);
          
          setEnvStatus({
            stripePublishable: !!data.stripePublishable,
            stripeSecret: !!data.stripeSecret,
            webhookSecret: !!data.webhookSecret,
            supabaseUrl: !!data.supabaseUrl,
            supabaseAnon: !!data.supabaseAnon,
            details: [
              `Stripe Publishable: ${data.stripePublishable ? '✅ Set' : '❌ Missing'}`,
              `Stripe Secret: ${data.stripeSecret ? '✅ Set' : '❌ Missing'}`,
              `Webhook Secret: ${data.webhookSecret ? '✅ Set' : '❌ Missing'}`,
              `Supabase URL: ${data.supabaseUrl ? '✅ Set' : '❌ Missing'}`,
              `Supabase Anon Key: ${data.supabaseAnon ? '✅ Set' : '❌ Missing'}`
            ]
          });
        } else {
          details.push('❌ Could not fetch environment data');
          setEnvStatus(prev => ({ ...prev, details }));
        }
      } catch (error) {
        details.push(`❌ Error: ${error}`);
        setEnvStatus(prev => ({ ...prev, details }));
      }
    };

    checkEnvironment();
  }, []);

  const allConfigured = envStatus.stripePublishable && 
                       envStatus.stripeSecret;

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md border">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Environment Debug
      </h3>
      
      {/* Overall Status */}
      <div className="mb-3">
        <div className="flex items-center mb-2">
          {allConfigured ? (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
          )}
          <span className="text-xs font-medium">
            {allConfigured ? 'Stripe Configured' : 'Configuration Issues Found'}
          </span>
        </div>
      </div>

      {/* Individual Status */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-xs">
          {envStatus.stripePublishable ? (
            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500 mr-2" />
          )}
          <span>Stripe Publishable Key</span>
        </div>
        
        <div className="flex items-center text-xs">
          {envStatus.stripeSecret ? (
            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500 mr-2" />
          )}
          <span>Stripe Secret Key</span>
        </div>
      </div>

      {/* Details */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        {envStatus.details.map((detail, index) => (
          <div key={index}>{detail}</div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-3 space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Refresh & Check Again
        </button>
        
        {!allConfigured && (
          <div className="text-xs text-red-600">
            ⚠️ Restart your server after updating .env.local
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentDebug; 