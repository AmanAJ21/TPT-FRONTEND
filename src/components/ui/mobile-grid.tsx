"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number | string
}

const MobileGrid = React.forwardRef<HTMLDivElement, MobileGridProps>(
  ({ className, children, cols = { default: 1, sm: 2, lg: 3, xl: 4 }, gap = 4, ...props }, ref) => {
    const gridClasses = cn(
      "grid",
      `grid-cols-${cols.default || 1}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
      typeof gap === "number" ? `gap-${gap}` : gap,
      className
    )

    return (
      <div
        ref={ref}
        className={gridClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileGrid.displayName = "MobileGrid"

interface MobileGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  span?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const MobileGridItem = React.forwardRef<HTMLDivElement, MobileGridItemProps>(
  ({ className, children, span, ...props }, ref) => {
    const spanClasses = cn(
      span?.default && `col-span-${span.default}`,
      span?.sm && `sm:col-span-${span.sm}`,
      span?.md && `md:col-span-${span.md}`,
      span?.lg && `lg:col-span-${span.lg}`,
      span?.xl && `xl:col-span-${span.xl}`,
      className
    )

    return (
      <div
        ref={ref}
        className={spanClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileGridItem.displayName = "MobileGridItem"

// Predefined responsive grid layouts
const MobileStatsGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MobileGrid
      ref={ref}
      cols={{ default: 1, sm: 2, lg: 3, xl: 6 }}
      gap={4}
      className={cn("mb-6", className)}
      {...props}
    >
      {children}
    </MobileGrid>
  )
)
MobileStatsGrid.displayName = "MobileStatsGrid"

const MobileContentGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MobileGrid
      ref={ref}
      cols={{ default: 1, xl: 3 }}
      gap={6}
      className={className}
      {...props}
    >
      {children}
    </MobileGrid>
  )
)
MobileContentGrid.displayName = "MobileContentGrid"

const MobileCardGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MobileGrid
      ref={ref}
      cols={{ default: 1, sm: 2, lg: 3 }}
      gap={4}
      className={className}
      {...props}
    >
      {children}
    </MobileGrid>
  )
)
MobileCardGrid.displayName = "MobileCardGrid"

export {
  MobileGrid,
  MobileGridItem,
  MobileStatsGrid,
  MobileContentGrid,
  MobileCardGrid,
}