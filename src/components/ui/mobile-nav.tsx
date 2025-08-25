"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"

interface MobileNavProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  className?: string
  side?: "left" | "right"
  onOpenChange?: (open: boolean) => void
}

const MobileNav = React.forwardRef<HTMLDivElement, MobileNavProps>(
  ({ children, trigger, className, side = "left", onOpenChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    }

    const handleClose = () => {
      handleOpenChange(false)
    }

    // Close on escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          handleClose()
        }
      }

      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [isOpen])

    // Prevent body scroll when open
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "unset"
      }

      return () => {
        document.body.style.overflow = "unset"
      }
    }, [isOpen])

    return (
      <>
        {/* Trigger */}
        <div onClick={() => handleOpenChange(true)}>
          {trigger || (
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          )}
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={handleClose}
          />
        )}

        {/* Navigation Panel */}
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 z-50 w-80 max-w-[85vw] bg-background border-border transform transition-transform duration-300 ease-in-out lg:hidden",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
            isOpen ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close navigation menu</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </>
    )
  }
)
MobileNav.displayName = "MobileNav"

export { MobileNav }