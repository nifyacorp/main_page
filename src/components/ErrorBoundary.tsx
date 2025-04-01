import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  section?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error(`Error in ${this.props.section || 'component'}:`, error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Check if it's an auth error and attempt auto-recovery
    if (error.message?.includes('MISSING_HEADERS') || 
        errorInfo.componentStack?.includes('API error response: MISSING_HEADERS')) {
      console.warn('Authentication error detected, checking local storage for tokens...');
      const hasToken = !!localStorage.getItem('accessToken');
      
      if (!hasToken) {
        console.warn('No access token found, redirecting to login...');
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    }
    
    // Update state with error details
    this.setState({
      errorInfo
    });
  }

  handleRetry = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // Default behavior: force refresh the component
      this.forceUpdate();
    }
  };
  
  handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      // Check for authentication errors
      const isAuthError = this.state.error?.message?.includes('MISSING_HEADERS') || 
        this.state.errorInfo?.componentStack?.includes('MISSING_HEADERS');
      
      return (
        <div className="p-4 m-4 border border-red-500 rounded bg-red-50">
          <h3 className="text-lg font-bold text-red-600">
            {isAuthError 
              ? 'Authentication Error' 
              : `Something went wrong ${this.props.section ? `in ${this.props.section}` : ''}`}
          </h3>
          <p className="text-sm text-red-500 mt-2">
            {isAuthError 
              ? 'Your session may have expired. Please try again or log in again.' 
              : this.state.error?.message || 'Unknown error'}
          </p>
          
          <div className="mt-4 flex gap-2">
            <button 
              onClick={this.handleRetry} 
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
            
            {isAuthError && (
              <a 
                href="/auth" 
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Log In
              </a>
            )}
            
            <button
              onClick={this.handleReload}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
          
          {this.state.errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">Show details</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;