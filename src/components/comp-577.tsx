"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoIcon from "@/app/favicon.ico"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  X,
  User,
  Home,
  Settings,
  ChevronRight,
  FileText,
  BarChart3,
  Truck,
  MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function MobileOptimizedHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect for mobile header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Navigation items
  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Settings },
    { href: "/entry", label: "Entry", icon: FileText },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/fleet", label: "Fleet", icon: Truck },
    { href: "/tracking", label: "Tracking", icon: MapPin },
  ]

  return (
    <>
      {/* Desktop Header - Enhanced */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 hidden lg:block">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 text-primary hover:text-primary/90 transition-colors">
                <div className="relative">
                  <img src={LogoIcon.src} alt="Logo" className="h-8 w-8 rounded-md" />
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Transport Manager
                </span>
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navigationItems.slice(1, 5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm" className="min-h-[44px] touch-manipulation">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="min-h-[44px] touch-manipulation">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Optimized */}
      <header className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 lg:hidden transition-all duration-200",
        isScrolled && "shadow-lg border-border/40"
      )}>
        <div className="px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center min-w-0 flex-1">
              <Link
                href="/"
                className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <img src={LogoIcon.src} alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" />
                  <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10" />
                </div>
                <span className="text-base sm:text-lg font-semibold truncate">Transport Manager</span>
              </Link>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className={cn(
                  "h-10 w-10 p-0 touch-manipulation relative transition-all duration-200",
                  "hover:bg-accent/50 active:scale-95",
                  isMobileMenuOpen && "bg-accent"
                )}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 transition-transform duration-200" />
                ) : (
                  <Menu className="h-5 w-5 transition-transform duration-200" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Only render when open */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile Menu Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300"
              onClick={closeMobileMenu}
            />

            {/* Mobile Menu Content */}
            <div className={cn(
              "fixed top-14 sm:top-16 left-0 right-0 bottom-0 bg-background border-t z-50",
              "transform transition-transform duration-300 ease-out",
              "flex flex-col translate-y-0"
            )}>
              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Primary navigation">
                <div className="space-y-2">
                  {/* Main Navigation Items */}
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg transition-colors touch-manipulation",
                            "hover:bg-accent/50 active:bg-accent",
                            isActive && "bg-accent/70 text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )
                    })}
                  </div>


                </div>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="px-4 py-4 border-t bg-muted/30 safe-area-inset-bottom">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full min-h-[52px] touch-manipulation active:scale-95 transition-transform"
                    >
                      <Link href="/login" onClick={closeMobileMenu}>
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="w-full min-h-[52px] touch-manipulation active:scale-95 transition-transform"
                    >
                      <Link href="/signup" onClick={closeMobileMenu}>
                        Get Started
                      </Link>
                    </Button>
                  </div>

                </div>
              </div>
            </div>

          </>
        )}
      </header >
    </>
  )
}