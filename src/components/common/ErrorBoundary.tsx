import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button, Card } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught runtime exception caught by ErrorBoundary:', error, errorInfo)
  }

  public handleReload = () => {
    window.location.reload()
  }

  public handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border border-gray-200">
            <div className="h-16 w-16 mx-auto bg-red-100 text-error rounded-2xl flex items-center justify-center shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">Something Went Wrong</h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Campus Connect encountered an unexpected issue while rendering this page. Our team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-100 rounded-lg text-left text-xs font-mono text-gray-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Home
              </Button>
              <Button
                size="sm"
                onClick={this.handleReload}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
