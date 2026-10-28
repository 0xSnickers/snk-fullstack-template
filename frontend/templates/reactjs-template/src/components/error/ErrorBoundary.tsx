import { Component, type ErrorInfo, type ReactNode } from 'react';
import { telemetry } from '@/services/telemetry';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** 渲染期错误兜底（路由内错误由 RouteErrorPage 处理）。 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    telemetry.captureError(error, {
      componentStack: errorInfo.componentStack,
      source: 'react_error_boundary',
    });
  }

  reset = () => this.setState({ hasError: false });

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback onRetry={this.reset} />;
    }

    return this.props.children;
  }
}
