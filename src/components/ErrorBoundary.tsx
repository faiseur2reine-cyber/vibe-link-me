import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
          <div className="text-center max-w-sm">
            <div className="text-[80px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/90 to-white/20 bg-clip-text text-transparent select-none mb-6">
              Oops
            </div>
            <p className="text-white/40 text-sm mb-6">
              Something went wrong. This has been logged.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-semibold hover:bg-white/90 transition-all duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
