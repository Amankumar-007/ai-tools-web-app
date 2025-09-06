'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Component Error</h2>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Error Message:</h3>
              <p className="text-red-700 font-mono text-sm">
                {this.state.error?.message || 'An unknown error occurred'}
              </p>
            </div>

            {this.state.errorInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Component Stack:</h3>
                <pre className="text-xs text-gray-600 overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  this.props.onRetry?.();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`
                  );
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy Error Details
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
