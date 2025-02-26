import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  section?: string;
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
    
    // Update state with error details
    this.setState({
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      return (
        <div className="p-4 m-4 border border-red-500 rounded bg-red-50">
          <h3 className="text-lg font-bold text-red-600">
            Something went wrong {this.props.section ? `in ${this.props.section}` : ''}
          </h3>
          <p className="text-sm text-red-500 mt-2">
            {this.state.error?.message || 'Unknown error'}
          </p>
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