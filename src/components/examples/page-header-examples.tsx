"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  PageHeader, 
  PageHeaderActions, 
  PageHeaderPrimaryAction, 
  PageHeaderSecondaryActions 
} from "@/components/ui/page-header"
import {
  Plus,
  Download,
  Filter,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  RefreshCw,
} from "lucide-react"

// Example 1: Simple page header
export function SimplePageHeaderExample() {
  return (
    <PageHeader
      title="Reports"
      description="View and analyze your transport business reports and analytics."
    />
  )
}

// Example 2: Page header with actions
export function PageHeaderWithActionsExample() {
  return (
    <PageHeader
      title="Transport Entries"
      description="Manage all your transport entries, track status, and monitor performance."
      actions={
        <PageHeaderActions>
          <PageHeaderPrimaryAction asChild>
            <Link href="/entry/new">
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </Link>
          </PageHeaderPrimaryAction>
          
          <PageHeaderSecondaryActions>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </PageHeaderSecondaryActions>
        </PageHeaderActions>
      }
    />
  )
}

// Example 3: Page header with stats (Dashboard style)
export function DashboardPageHeaderExample() {
  const stats = [
    {
      label: "Total Revenue",
      value: "₹2,45,000",
      icon: DollarSign,
      color: 'green' as const,
      trend: { value: "+12%", direction: 'up' as const }
    },
    {
      label: "Active Entries",
      value: "156",
      icon: Package,
      color: 'blue' as const,
      trend: { value: "+8%", direction: 'up' as const }
    },
    {
      label: "Completion Rate",
      value: "94%",
      icon: BarChart3,
      color: 'purple' as const,
      trend: { value: "+2%", direction: 'up' as const }
    },
    {
      label: "Active Users",
      value: "24",
      icon: Users,
      color: 'orange' as const,
      trend: { value: "0%", direction: 'neutral' as const }
    },
  ]

  return (
    <PageHeader
      variant="gradient"
      title="Dashboard"
      description="Welcome back! Here's an overview of your transport business performance."
      stats={stats}
      actions={
        <PageHeaderActions>
          <PageHeaderPrimaryAction asChild>
            <Link href="/entry/new">
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </Link>
          </PageHeaderPrimaryAction>
          
          <PageHeaderSecondaryActions>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </PageHeaderSecondaryActions>
        </PageHeaderActions>
      }
    />
  )
}

// Example 4: Page header with breadcrumbs
export function PageHeaderWithBreadcrumbsExample() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/reports" },
    { label: "Monthly Analysis" },
  ]

  return (
    <PageHeader
      title="Monthly Analysis"
      description="Detailed analysis of your monthly transport business performance."
      breadcrumbs={breadcrumbs}
      actions={
        <PageHeaderActions>
          <PageHeaderPrimaryAction asChild>
            <Link href="/reports/export">
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </Link>
          </PageHeaderPrimaryAction>
          
          <PageHeaderSecondaryActions>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </PageHeaderSecondaryActions>
        </PageHeaderActions>
      }
    />
  )
}

// Example 5: Minimal page header
export function MinimalPageHeaderExample() {
  return (
    <PageHeader
      variant="minimal"
      title="Settings"
      description="Manage your account settings and preferences."
      actions={
        <Button size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      }
    />
  )
}

// Example 6: Custom content in header
export function CustomPageHeaderExample() {
  return (
    <PageHeader
      title="Vehicle Management"
      description="Track and manage your fleet of vehicles."
    >
      {/* Custom content */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">24 Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">3 Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">1 Offline</span>
        </div>
      </div>
    </PageHeader>
  )
}