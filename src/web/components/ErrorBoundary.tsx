import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { logger } from '../utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with full context
    logger.error('Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Optionally reload the page
    // window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-gray-800 border-2 border-red-600 p-8 shadow-depth-3">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">
                Что-то пошло не так
              </h1>
              <p className="text-gray-300 text-lg">
                Произошла непредвиденная ошибка в приложении
              </p>
            </div>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 bg-gray-900 border border-gray-700 p-4 overflow-auto max-h-64">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-400 text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 font-bold text-lg text-white transition-all duration-200 hover:shadow-depth-3 hover:scale-105"
              >
                🔄 Попробовать снова
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 font-bold text-lg text-gray-200 transition-all duration-200 hover:shadow-depth-2 hover:scale-105"
              >
                🏠 На главную
              </button>
            </div>

            {/* Help Text */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Если проблема повторяется, попробуйте обновить страницу или очистить кеш браузера
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
