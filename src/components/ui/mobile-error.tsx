"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Home,
  ArrowLeft,
  Bug,
  Wifi,
  WifiOff,
  Server
} from "lucide-react"

interface MobileErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'warning' | 'info' | 'network' | 'server' | '404' | '500'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  onRetry?: () => void
  onHome?: () => void
  onBack?: () => void
}

const MobileError = React.forwardRef<HTMLDivElement, MobileErrorProps>(
  ({ 
    className, 
    variant = 'error',
    title,
    description,
    action,
    showRetry = true,
    showHome = false,
    showBack = false,
    onRetry,
    onHome,
    onBack,
    ...props 
  }, ref) => {
    const getErrorConfig = () => {
      switch (variant) {
        case 'network':
          return {
            icon: WifiOff,
            defaultTitle: 'Network Error',
            defaultDescription: 'Please check your internet connection and try again.',
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
          }
        case 'server':
          return {
            icon: Server,
            defaultTitle: 'Server Error',
            defaultDescription: 'Something went wrong on our end. Please try again later.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
          }
        case '404':
          return {
            icon: AlertCircle,
            defaultTitle: 'Page Not Found',
            defaultDescription: 'The page you are looking for does not exist.',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20'
          }
        case '500':
          return {
            icon: XCircle,
            defaultTitle: 'Internal Server Error',
            defaultDescription: 'An unexpected error occurred. Please try again later.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
          }
        case 'warning':
          return {
            icon: AlertTriangle,
            defaultTitle: 'Warning',
            defaultDescription: 'Please review the information and try again.',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
          }
        case 'info':
          return {
            icon: Info,
            defaultTitle: 'Information',
            defaultDescription: 'Here is some important information.',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20'
          }
        case 'error':
        default:
          return {
            icon: XCircle,
            defaultTitle: 'Error',
            defaultDescription: 'An error occurred. Please try again.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
          }
      }
    }

    const config = getErrorConfig()
    const IconComponent = config.icon

    const handleRetry = () => {
      if (onRetry) {
        onRetry()
      } else {
        window.location.reload()
      }
    }

    const handleHome = () => {
      if (onHome) {
        onHome()
      } else {
        window.location.href = '/'
      }
    }

    const handleBack = () => {
      if (onBack) {
        onBack()
      } else {
        window.history.back()
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center p-4", className)}
        {...props}
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
              config.bgColor
            )}>
              <IconComponent className={cn("h-8 w-8", config.iconColor)} />
            </div>
            
            <CardTitle className="text-lg mb-2">
              {title || config.defaultTitle}
            </CardTitle>
            
            <CardDescription className="text-sm text-muted-foreground mb-6">
              {description || config.defaultDescription}
            </CardDescription>

            <div className="space-y-3">
              {/* Custom action */}
              {action && (
                <Button
                  onClick={action.onClick}
                  className="w-full min-h-[48px] touch-manipulation"
                >
                  {action.label}
                </Button>
              )}

              {/* Default actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {showRetry && (
                  <Button
                    onClick={handleRetry}
                    className="flex-1 min-h-[48px] touch-manipulation"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {showHome && (
                  <Button
                    variant="outline"
                    onClick={handleHome}
                    className="flex-1 min-h-[48px] touch-manipulation"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                {showBack && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 min-h-[48px] touch-manipulation"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)
MobileError.displayName = "MobileError"

// Inline error component for smaller spaces
interface InlineErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  variant?: 'error' | 'warning' | 'info'
  showIcon?: boolean
}

const InlineError = React.forwardRef<HTMLDivElement, InlineErrorProps>(
  ({ className, message, variant = 'error', showIcon = true, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'warning':
          return {
            icon: AlertTriangle,
            className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200'
          }
        case 'info':
          return {
            icon: Info,
            className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-200'
          }
        case 'error':
        default:
          return {
            icon: AlertCircle,
            className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200'
          }
      }
    }

    const config = getVariantStyles()
    const IconComponent = config.icon

    return (
      <Alert ref={ref} className={cn(config.className, className)} {...props}>
        {showIcon && <IconComponent className="h-4 w-4" />}
        <AlertDescription className="text-sm">
          {message}
        </AlertDescription>
      </Alert>
    )
  }
)
InlineError.displayName = "InlineError"

// Pre-configured error states
const ErrorStates = {
  // Network connectivity issues
  network: (onRetry?: () => void) => (
    <MobileError
      variant="network"
      showRetry
      onRetry={onRetry}
    />
  ),

  // Server errors
  server: (onRetry?: () => void) => (
    <MobileError
      variant="server"
      showRetry
      showHome
      onRetry={onRetry}
    />
  ),

  // 404 Not Found
  notFound: () => (
    <MobileError
      variant="404"
      showHome
      showBack
    />
  ),

  // 500 Internal Server Error
  serverError: (onRetry?: () => void) => (
    <MobileError
      variant="500"
      showRetry
      showHome
      onRetry={onRetry}
    />
  ),

  // Generic error with custom message
  generic: (message: string, onRetry?: () => void) => (
    <MobileError
      title="Something went wrong"
      description={message}
      showRetry
      onRetry={onRetry}
    />
  ),

  // Form validation error
  validation: (message: string) => (
    <InlineError
      variant="error"
      message={message}
    />
  ),

  // Warning message
  warning: (message: string) => (
    <InlineError
      variant="warning"
      message={message}
    />
  ),

  // Info message
  info: (message: string) => (
    <InlineError
      variant="info"
      message={message}
    />
  )
}

// Error boundary component for React error handling
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class MobileErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return (
        <MobileError
          title="Something went wrong"
          description="An unexpected error occurred. Please try refreshing the page."
          action={{
            label: "Try Again",
            onClick: this.retry
          }}
          showHome
        />
      )
    }

    return this.props.children
  }
}

export {
  MobileError,
  InlineError,
  ErrorStates,
  MobileErrorBoundary,
}