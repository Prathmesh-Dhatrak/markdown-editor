import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Error boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Optionally reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex items-center mb-4">
              <svg
                className="w-12 h-12 text-red-500 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  The application encountered an unexpected error.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <h2 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {import.meta.env.DEV && this.state.errorInfo && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded max-h-64 overflow-auto">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Component Stack:
                </h2>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Go to Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If this problem persists, please try:
              </p>
              <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Checking the browser console for more details</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
