"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"


interface MobileLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const MobileLoading = React.forwardRef<HTMLDivElement, MobileLoadingProps>(
  ({ className, variant = 'spinner', size = 'md', text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    }

    const containerSizeClasses = {
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-12'
    }

    const renderSpinner = () => (
      <div className="flex items-center justify-center">
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )} />
      </div>
    )

    const renderDots = () => (
      <div className="flex items-center justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary animate-pulse",
              size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    )

    const renderPulse = () => (
      <div className="flex items-center justify-center">
        <div className={cn(
          "rounded-full bg-primary animate-pulse",
          sizeClasses[size]
        )} />
      </div>
    )

    const renderContent = () => {
      switch (variant) {
        case 'dots':
          return renderDots()
        case 'pulse':
          return renderPulse()
        case 'spinner':
        default:
          return renderSpinner()
      }
    }

    if (variant === 'skeleton') {
      return (
        <div
          ref={ref}
          className={cn("space-y-4", containerSizeClasses[size], className)}
          {...props}
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          containerSizeClasses[size],
          className
        )}
        {...props}
      >
        {renderContent()}
        {text && (
          <p className="text-sm text-muted-foreground text-center">
            {text}
          </p>
        )}
      </div>
    )
  }
)
MobileLoading.displayName = "MobileLoading"

// Skeleton component if not already available
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

// Pre-configured loading states
interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

const LoadingCard = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ title = "Loading...", description, className }, ref) => (
    <Card ref={ref} className={className}>
      <CardContent className="p-6">
        <MobileLoading
          variant="spinner"
          size="md"
          text={description || title}
        />
      </CardContent>
    </Card>
  )
)
LoadingCard.displayName = "LoadingCard"

const LoadingPage = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ title = "Loading page...", description, className }, ref) => (
    <div
      ref={ref}
      className={cn("min-h-[400px] flex items-center justify-center", className)}
    >
      <MobileLoading
        variant="spinner"
        size="lg"
        text={description || title}
      />
    </div>
  )
)
LoadingPage.displayName = "LoadingPage"

const LoadingTable = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-3", className)} {...props}>
      {/* Table header skeleton */}
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Table rows skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
)
LoadingTable.displayName = "LoadingTable"

const LoadingStats = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
      {...props}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
)
LoadingStats.displayName = "LoadingStats"

// Loading states for different mobile scenarios
const MobileLoadingStates = {
  // Full page loading
  page: (text?: string) => (
    <LoadingPage title={text} />
  ),
  
  // Card loading
  card: (text?: string) => (
    <LoadingCard title={text} />
  ),
  
  // Table loading
  table: () => (
    <LoadingTable />
  ),
  
  // Stats loading
  stats: () => (
    <LoadingStats />
  ),
  
  // Inline loading
  inline: (size: 'sm' | 'md' | 'lg' = 'sm') => (
    <MobileLoading variant="spinner" size={size} />
  ),
  
  // Button loading
  button: () => (
    <MobileLoading variant="dots" size="sm" />
  )
}

export {
  MobileLoading,
  Skeleton,
  LoadingCard,
  LoadingPage,
  LoadingTable,
  LoadingStats,
  MobileLoadingStates,
}