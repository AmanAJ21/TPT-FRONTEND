"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  stats?: Array<{
    label: string
    value: string | number
    icon?: React.ComponentType<{ className?: string }>
    color?: 'green' | 'blue' | 'orange' | 'purple' | 'red'
    trend?: {
      value: string
      direction: 'up' | 'down' | 'neutral'
    }
  }>
  variant?: 'default' | 'gradient' | 'minimal'
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className, 
    title, 
    description, 
    children, 
    actions, 
    breadcrumbs, 
    stats,
    variant = 'default',
    ...props 
  }, ref) => {
    const colorClasses = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          variant === 'gradient' && "bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl",
          className
        )}
        {...props}
      >
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl -z-10" />
        )}
        
        <div className={cn(
          "space-y-6",
          variant === 'gradient' ? "p-6 sm:p-8" : "py-6"
        )}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Main header content */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left side - Title and description */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                    {description}
                  </p>
                )}
              </div>

              {/* Stats row */}
              {stats && stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <div 
                        key={index}
                        className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50"
                      >
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center",
                              stat.color ? colorClasses[stat.color] : colorClasses.blue
                            )}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{stat.value}</p>
                              {stat.trend && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs px-1 py-0",
                                    stat.trend.direction === 'up' && "text-green-600 bg-green-100 dark:bg-green-900/30",
                                    stat.trend.direction === 'down' && "text-red-600 bg-red-100 dark:bg-red-900/30",
                                    stat.trend.direction === 'neutral' && "text-gray-600 bg-gray-100 dark:bg-gray-900/30"
                                  )}
                                >
                                  {stat.trend.value}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Custom children content */}
              {children}
            </div>

            {/* Right side - Actions */}
            {actions && (
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

// Predefined action components for common use cases
interface PageHeaderActionsProps {
  children: React.ReactNode
  className?: string
}

const PageHeaderActions = React.forwardRef<HTMLDivElement, PageHeaderActionsProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PageHeaderActions.displayName = "PageHeaderActions"

const PageHeaderPrimaryAction = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, size = "lg", ...props }, ref) => (
  <Button
    ref={ref}
    size={size}
    className={cn("w-full justify-center shadow-md hover:shadow-lg transition-shadow", className)}
    {...props}
  />
))
PageHeaderPrimaryAction.displayName = "PageHeaderPrimaryAction"

const PageHeaderSecondaryActions = React.forwardRef<HTMLDivElement, PageHeaderActionsProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PageHeaderSecondaryActions.displayName = "PageHeaderSecondaryActions"

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderPrimaryAction,
  PageHeaderSecondaryActions,
}