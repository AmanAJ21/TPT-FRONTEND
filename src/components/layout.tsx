"use client"

import { useState, useCallback, useMemo, memo, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  User,
  Settings,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  Type,
  EyeOff,
  Truck,
  FileText,
  PieChart,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  X
} from "lucide-react"


// Constants
const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-20',
  TEXT_HIDDEN: 'w-24'
} as const

const ANIMATION_DURATION = 'duration-300'
const STORAGE_KEY = 'sidebar-hidden'
const TEXT_STORAGE_KEY = 'sidebar-text-hidden'

// Utility functions for localStorage
const getSavedSidebarState = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : false
  } catch {
    return false
  }
}

const saveSidebarState = (hidden: boolean): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden))
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Utility functions for text visibility localStorage
const getSavedTextState = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const saved = localStorage.getItem(TEXT_STORAGE_KEY)
    return saved ? JSON.parse(saved) : false
  } catch {
    return false
  }
}

const saveTextState = (hidden: boolean): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TEXT_STORAGE_KEY, JSON.stringify(hidden))
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Enhanced Icon components with better styling
const DashboardIcon = memo(() => (
  <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
))
DashboardIcon.displayName = 'DashboardIcon'

const ProfileIcon = memo(() => (
  <User className="h-5 w-5" strokeWidth={1.5} />
))
ProfileIcon.displayName = 'ProfileIcon'

const SettingsIcon = memo(() => (
  <Settings className="h-5 w-5" strokeWidth={1.5} />
))
SettingsIcon.displayName = 'SettingsIcon'

const AnalyticsIcon = memo(() => (
  <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
))
AnalyticsIcon.displayName = 'AnalyticsIcon'

const LogoutIcon = memo(() => (
  <LogOut className="h-5 w-5" strokeWidth={1.5} />
))
LogoutIcon.displayName = 'LogoutIcon'

const TransportIcon = memo(() => (
  <Truck className="h-5 w-5" strokeWidth={1.5} />
))
TransportIcon.displayName = 'TransportIcon'

// Additional icon components
const ReportsIcon = memo(() => (
  <FileText className="h-5 w-5" strokeWidth={1.5} />
))
ReportsIcon.displayName = 'ReportsIcon'

const AnalysisIcon = memo(() => (
  <PieChart className="h-5 w-5" strokeWidth={1.5} />
))
AnalysisIcon.displayName = 'AnalysisIcon'

const AddEntryIcon = memo(() => (
  <Plus className="h-5 w-5" strokeWidth={1.5} />
))
AddEntryIcon.displayName = 'AddEntryIcon'

const SearchIcon = memo(() => (
  <Search className="h-5 w-5" strokeWidth={1.5} />
))
SearchIcon.displayName = 'SearchIcon'

const FilterIcon = memo(() => (
  <Filter className="h-5 w-5" strokeWidth={1.5} />
))
FilterIcon.displayName = 'FilterIcon'

const ExportIcon = memo(() => (
  <Download className="h-5 w-5" strokeWidth={1.5} />
))
ExportIcon.displayName = 'ExportIcon'

const PrintIcon = memo(() => (
  <Printer className="h-5 w-5" strokeWidth={1.5} />
))
PrintIcon.displayName = 'PrintIcon'

// Base navigation items (always visible)
const baseNavigationItems = [
  {
    id: 'dashboard',
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
  {
    id: 'entry',
    title: "Entry",
    href: "/entry",
    icon: TransportIcon,
  },
  {
    id: 'profile',
    title: "Profile",
    href: "/profile",
    icon: ProfileIcon,
  },
  {
    id: 'analysis',
    title: 'Analysis',
    href: '/analysis',
    icon: AnalysisIcon,
  },
  {
    id: 'reports',
    title: 'Reports',
    href: '/reports',
    icon: ReportsIcon
  },
] as const

// Function to get navigation items based on current page
const getNavigationItems = (pathname: string) => {
  return [...baseNavigationItems]
}

// Simple Navigation Item Component
const NavigationItem = memo(({
  item,
  isActive,
  isCollapsed,
  onAction,
  onMobileClick
}: {
  item: any & { isActive?: boolean; action?: string }
  isActive: boolean
  isCollapsed: boolean
  onAction?: (action: string) => void
  onMobileClick?: () => void
}) => {
  const IconComponent = item.icon

  const handleClick = (e: React.MouseEvent) => {
    if (item.action && onAction) {
      e.preventDefault()
      onAction(item.action)
    }
    // Close mobile sidebar when item is clicked
    if (onMobileClick) {
      onMobileClick()
    }
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
          "min-h-[44px] touch-manipulation", // Better touch targets for mobile
          isCollapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/80"
        )}
        title={isCollapsed ? item.title : undefined}
        aria-label={isCollapsed ? item.title : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        <IconComponent />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </Link>
    </li>
  )
})
NavigationItem.displayName = 'NavigationItem'

// Main Layout Props
interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [textHidden, setTextHidden] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()

  // Load saved state on mount
  useEffect(() => {
    setSidebarHidden(getSavedSidebarState())
    setTextHidden(getSavedTextState())
    setIsHydrated(true)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  // Memoized handlers
  const handleToggleMenu = useCallback(() => {
    setSidebarHidden(prev => {
      const newState = !prev
      saveSidebarState(newState)
      return newState
    })
  }, [])

  const handleToggleText = useCallback(() => {
    setTextHidden(prev => {
      const newState = !prev
      saveTextState(newState)
      return newState
    })
  }, [])

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  const handleMobileSidebarToggle = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev)
  }, [])

  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  // Handle menu actions (export, print, etc.)
  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'export':
        // Trigger export functionality
        const exportButton = document.querySelector('[data-export-button]') as HTMLButtonElement
        if (exportButton) exportButton.click()
        break
      case 'print':
        // Trigger print functionality
        const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement
        if (printButton) printButton.click()
        break
      default:
        // Unknown action - no operation needed
    }
  }, [])

  // Get navigation items based on current page
  const currentNavigationItems = useMemo(() => getNavigationItems(pathname), [pathname])

  // Memoized navigation items with active state
  const navigationWithActiveState = useMemo(() =>
    currentNavigationItems.map(item => ({
      ...item,
      isActive: pathname === item.href
    }))
    , [currentNavigationItems, pathname])

  // Dynamic title based on URL
  const pageTitle = useMemo(() => {
    const currentItem = currentNavigationItems.find(item => item.href === pathname)
    if (currentItem) return currentItem.title

    // Fallback titles for specific pages
    switch (pathname) {
      case '/reports':
        return 'Reports'
      case '/analysis':
        return 'Analysis'
      case '/entry/new':
        return 'Add New Entry'
      default:
        return 'Dashboard'
    }
  }, [currentNavigationItems, pathname])

  // Prevent hydration mismatch by not rendering until client-side state is loaded
  if (!isHydrated) {
    return (
      <div className={cn("flex h-screen bg-background", className)}>
        <aside className="w-64 bg-card border-r border-border flex-shrink-0" />
        <main className="flex-1 overflow-hidden" role="main">
          <div className="h-full overflow-auto">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen bg-background", "p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden", className)}>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleMobileSidebarClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar rounded-lg border border-sidebar-border transition-all ease-in-out flex-shrink-0 overflow-hidden",
          ANIMATION_DURATION,
          // Mobile: Fixed positioning with slide animation
          "fixed lg:relative z-50 lg:z-auto",
          "h-full lg:h-auto",
          "left-2 top-2 bottom-2 lg:left-auto lg:top-auto lg:bottom-auto",
          // Width based on screen size and text visibility
          "w-64 sm:w-72 lg:w-auto",
          sidebarHidden ? "lg:w-0 lg:opacity-0" : textHidden ? "lg:w-24" : "lg:w-64",
          // Mobile slide animation
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!textHidden && (
              <span className="text-sm font-semibold text-sidebar-foreground">
                Menu
              </span>
            )}
            <div className="flex items-center gap-2">
              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileSidebarClose}
                className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
              {/* Text toggle button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleText}
                className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
                aria-label={textHidden ? "Show text" : "Hide text"}
                title={textHidden ? "Show text" : "Hide text"}
              >
                {textHidden ? <Type className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4" aria-label="Primary navigation">
          <ul className="space-y-1" role="list">
            {navigationWithActiveState.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={item.isActive}
                isCollapsed={textHidden}
                onAction={handleMenuAction}
                onMobileClick={handleMobileSidebarClose}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 bg-card rounded-lg border border-border flex flex-col overflow-hidden"
        role="main"
        aria-label="Main content"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-border flex-shrink-0">
          {/* Left: Show/Hide Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileSidebarToggle}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1 sm:gap-2 min-h-[44px] touch-manipulation lg:hidden"
            aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="hidden sm:inline">{isMobileSidebarOpen ? "Close Menu" : "Open Menu"}</span>
          </Button>

          {/* Desktop: Hide/Show Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleMenu}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 min-h-[44px] touch-manipulation hidden lg:flex"
            aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarHidden ? 'rotate-180' : ''}`} />
            <span>Menu</span>
          </Button>

          {/* Center: Dynamic Title */}
          <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate mx-2 flex-1 text-center sm:text-left">
            {pageTitle}
          </h1>

          {/* Right: Theme and Logout Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-accent h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-accent h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}