import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-4" style={{ background: '#0b0d11', color: '#f3f4f6' }}>
          <div className="card-x text-center p-4" style={{ maxWidth: '480px' }}>
            <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={36} />
            </div>
            <h4 className="mb-2">Admin Dashboard Error</h4>
            <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              className="btn-dark-x d-inline-flex align-items-center gap-2 mx-auto"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              <RefreshCw size={16} /> Reload Admin Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
