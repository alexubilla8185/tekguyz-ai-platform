import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center animate-in fade-in duration-500">
          <div className="p-4 rounded-full bg-surface-high/30 mb-6 animate-pulse">
             <AlertTriangle className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Something went slightly off script.
          </h1>
          <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
            Don't worry—your data is safe. We just encountered a temporary glitch. 
            Refreshing the page usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}