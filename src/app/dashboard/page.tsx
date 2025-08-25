"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  Share2,
  Mail,
  Hash,
  FileText,
  Banknote,
  Copy,
  Check,
  Truck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  Route,
  Users,
  Activity,
  RefreshCw,
  ArrowRight,
  Eye,
  Edit,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { TransportBill, BillStatus } from "@/lib/transport-types"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [profileCopied, setProfileCopied] = useState(false)
  const [bankCopied, setBankCopied] = useState(false)
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalEntries: number;
      completedEntries: number;
      pendingEntries: number;
      totalRevenue: number;
      monthlyRevenue: number;
      activeVehicles: number;
      avgRevenuePerTrip: number;
      thisMonthEntries: number;
      lastMonthEntries: number;
    };
    recentEntries: Array<{
      id: string;
      vehicle: string;
      route: string;
      status: string;
      amount: number;
      date: string;
      driver?: string;
    }>;
    topRoutes: Array<{
      route: string;
      trips: number;
      revenue: number;
      avgDays?: number;
      distance?: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      entries: number;
      revenue: number;
    }>;
    vehiclePerformance: Array<{
      vehicle: string;
      trips: number;
      revenue: number;
      efficiency: number;
      lastService?: string;
    }>;
    statusBreakdown: {
      completed: number;
      pending: number;
      in_transit: number;
    };
  }>({
    stats: {
      totalEntries: 0,
      completedEntries: 0,
      pendingEntries: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeVehicles: 0,
      avgRevenuePerTrip: 0,
      thisMonthEntries: 0,
      lastMonthEntries: 0
    },
    recentEntries: [],
    topRoutes: [],
    monthlyTrend: [],
    vehiclePerformance: [],
    statusBreakdown: {
      completed: 0,
      pending: 0,
      in_transit: 0
    }
  })
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Helper function to convert API response to proper TransportBill objects
  const convertApiResponseToTransportBill = (apiData: any): TransportBill => {
    return {
      ...apiData,
      id: apiData.id,
      _id: apiData._id,
      date: new Date(apiData.date),
      transportBillData: {
        ...apiData.transportBillData,
        lrDate: new Date(apiData.transportBillData.lrDate)
      },
      ownerData: {
        ...apiData.ownerData,
        policyDate: new Date(apiData.ownerData.policyDate),
        advDate1: new Date(apiData.ownerData.advDate1),
        advDate2: new Date(apiData.ownerData.advDate2),
        advDate3: new Date(apiData.ownerData.advDate3),
        finalDate: new Date(apiData.ownerData.finalDate),
        deliveryDate: new Date(apiData.ownerData.deliveryDate)
      },
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : undefined,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
    }
  }

  // Helper function to get month name
  const getMonthName = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthIndex]
  }

  // Helper function to calculate analytics from transport entries
  const calculateAnalytics = (entries: TransportBill[]) => {
    if (entries.length === 0) {
      return {
        stats: {
          totalEntries: 0,
          completedEntries: 0,
          pendingEntries: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeVehicles: 0,
          avgRevenuePerTrip: 0,
          thisMonthEntries: 0,
          lastMonthEntries: 0
        },
        recentEntries: [],
        topRoutes: [],
        monthlyTrend: [],
        vehiclePerformance: [],
        statusBreakdown: {
          completed: 0,
          pending: 0,
          in_transit: 0
        }
      }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Calculate basic stats
    const totalEntries = entries.length
    const completedEntries = entries.filter(e => e.transportBillData.status === BillStatus.COMPLETED).length
    const pendingEntries = entries.filter(e => e.transportBillData.status === BillStatus.PENDING).length
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.transportBillData.total, 0)

    // This month entries
    const thisMonthEntries = entries.filter(entry => {
      const entryDate = entry.date
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    }).length

    // Last month entries
    const lastMonthEntries = entries.filter(entry => {
      const entryDate = entry.date
      return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear
    }).length

    // Monthly revenue (current month)
    const monthlyRevenue = entries
      .filter(entry => {
        const entryDate = entry.date
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
      })
      .reduce((sum, entry) => sum + entry.transportBillData.total, 0)

    // Active vehicles (unique vehicle numbers)
    const activeVehicles = new Set(entries.map(entry => entry.vehicleNo)).size

    // Average revenue per trip
    const avgRevenuePerTrip = totalEntries > 0 ? totalRevenue / totalEntries : 0

    // Recent entries (last 5)
    const recentEntries = entries
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(entry => ({
        id: entry.id || entry._id || 'N/A',
        vehicle: entry.vehicleNo,
        route: `${entry.from} → ${entry.to}`,
        status: entry.transportBillData.status.toLowerCase(),
        amount: entry.transportBillData.total,
        date: entry.date.toLocaleDateString(),
        driver: entry.ownerData.driverNameAndMob.split(' - ')[0] || 'N/A'
      }))

    // Top routes by revenue
    const routeStats = entries.reduce((acc, entry) => {
      const route = `${entry.from} → ${entry.to}`
      if (!acc[route]) {
        acc[route] = { trips: 0, revenue: 0 }
      }
      acc[route].trips += 1
      acc[route].revenue += entry.transportBillData.total
      return acc
    }, {} as Record<string, { trips: number; revenue: number }>)

    const topRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        trips: stats.trips,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)

    // Vehicle performance
    const vehicleStats = entries.reduce((acc, entry) => {
      const vehicle = entry.vehicleNo
      if (!acc[vehicle]) {
        acc[vehicle] = { trips: 0, revenue: 0 }
      }
      acc[vehicle].trips += 1
      acc[vehicle].revenue += entry.transportBillData.total
      return acc
    }, {} as Record<string, { trips: number; revenue: number }>)

    const vehiclePerformance = Object.entries(vehicleStats)
      .map(([vehicle, stats]) => ({
        vehicle,
        trips: stats.trips,
        revenue: stats.revenue,
        efficiency: Math.min(95, Math.max(75, 80 + (stats.trips * 2))) // Mock efficiency based on trips
      }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 4)

    // Monthly trend (last 6 months)
    const monthlyStats: Record<string, { entries: number; revenue: number }> = {}

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyStats[monthKey] = { entries: 0, revenue: 0 }
    }

    entries.forEach(entry => {
      const entryDate = entry.date
      const monthKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}`
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].entries += 1
        monthlyStats[monthKey].revenue += entry.transportBillData.total
      }
    })

    const monthlyTrend = Object.entries(monthlyStats)
      .map(([key, stats]) => {
        const [year, month] = key.split('-')
        return {
          month: getMonthName(parseInt(month)),
          entries: stats.entries,
          revenue: stats.revenue
        }
      })

    // Status breakdown
    const statusBreakdown = {
      completed: entries.filter(e => e.transportBillData.status === BillStatus.COMPLETED).length,
      pending: entries.filter(e => e.transportBillData.status === BillStatus.PENDING).length,
      in_transit: entries.filter(e => e.transportBillData.status === BillStatus.IN_PROGRESS).length
    }

    return {
      stats: {
        totalEntries,
        completedEntries,
        pendingEntries,
        totalRevenue,
        monthlyRevenue,
        activeVehicles,
        avgRevenuePerTrip,
        thisMonthEntries,
        lastMonthEntries
      },
      recentEntries,
      topRoutes,
      monthlyTrend,
      vehiclePerformance,
      statusBreakdown
    }
  }

  // Load real dashboard data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      setIsLoadingData(true)
      setDataError(null)

      try {
        // Fetch transport entries from API
        const response = await apiClient.getTransportEntries({
          limit: 1000 // Get all entries for analytics
        })

        if (response.success && response.data) {
          const convertedEntries = (response.data.entries || []).map(convertApiResponseToTransportBill)
          const analytics = calculateAnalytics(convertedEntries)
          setDashboardData(analytics)
        } else {
          setDataError(response.error || "Failed to fetch dashboard data")
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error)
        setDataError("Failed to load dashboard data")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadDashboardData()
  }, [user])

  const getProfileShareText = () => {
    if (!user?.profile) return 'No profile data available'

    return [
      `Owner: ${user.profile.ownerName || 'N/A'}`,
      `Company: ${user.profile.companyName || 'N/A'}`,
      `Email: ${user.email || 'N/A'}`,
      `Mobile: ${user.profile.mobileNumber || 'N/A'}`,
      `Address: ${user.profile.address || 'N/A'}`,
      user.profile.gstNumber ? `GST: ${user.profile.gstNumber}` : null,
      user.profile.panNumber ? `PAN: ${user.profile.panNumber}` : null
    ].filter(Boolean).join('\n')
  }

  const getBankShareText = () => {
    if (!user?.bank) return 'No bank details available'

    return [
      user.bank?.bankName ? `Bank: ${user.bank.bankName}` : null,
      user.bank?.accountHolderName ? `Account Holder: ${user.bank.accountHolderName}` : null,
      user.bank?.accountNumber ? `Account Number: ****${user.bank.accountNumber.slice(-4)}` : null,
      user.bank?.ifscCode ? `IFSC: ${user.bank.ifscCode}` : null,
      user.bank?.bankBranchName ? `Branch: ${user.bank.bankBranchName}` : null
    ].filter(Boolean).join('\n')
  }

  const handleProfileCopy = async () => {
    try {
      await navigator.clipboard.writeText(getProfileShareText())
      setProfileCopied(true)
      setTimeout(() => setProfileCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy profile to clipboard:', error)
    }
  }

  const handleBankCopy = async () => {
    try {
      await navigator.clipboard.writeText(getBankShareText())
      setBankCopied(true)
      setTimeout(() => setBankCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy bank details to clipboard:', error)
    }
  }

  const ProfileShareModal = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Share Profile Information</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Copy your profile details to share
          </p>
        </div>
        <div className="p-4">
          <div className="bg-muted rounded-md p-3 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto mb-3">
            {getProfileShareText()}
          </div>
          <Button
            onClick={handleProfileCopy}
            className="w-full flex items-center gap-2"
            variant={profileCopied ? "secondary" : "default"}
          >
            {profileCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  const BankShareModal = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Bank Details
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Share Bank Details</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Copy your banking information to share
          </p>
        </div>
        <div className="p-4">
          <div className="bg-muted rounded-md p-3 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto mb-3">
            {getBankShareText()}
          </div>
          <Button
            onClick={handleBankCopy}
            className="w-full flex items-center gap-2"
            variant={bankCopied ? "secondary" : "default"}
          >
            {bankCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  // If auth is loading, show minimal loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Show loading state while fetching dashboard data
  if (isLoadingData) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.profile?.ownerName || 'User'}</h1>
              <p className="text-muted-foreground">Loading your transport business data...</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/entry">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Link>
              </Button>
            </div>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Show error state if data loading failed
  if (dataError) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.profile?.ownerName || 'User'}</h1>
              <p className="text-muted-foreground">Here's what's happening with your transport business today.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/entry">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard Data</h3>
                <p className="text-muted-foreground mb-4">{dataError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // Show empty state if no data
  if (dashboardData.stats.totalEntries === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.profile?.ownerName || 'User'}</h1>
              <p className="text-muted-foreground">Get started by adding your first transport entry.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/entry">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">No Transport Entries Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start managing your transport business by adding your first entry.
                  Track vehicles, routes, and revenue all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link href="/entry">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Entry
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/profile">
                      <User className="h-5 w-5 mr-2" />
                      Complete Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Truck className="h-3 w-3 mr-1" />In Transit</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Enhanced Header Section */}
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl -z-10" />

            <div className="p-6 sm:p-8">
              {/* Main header content */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left side - Welcome message and stats */}
                <div className="flex-1 space-y-4">
                  {/* Welcome message */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Welcome back, {user?.profile?.ownerName || 'User'}!
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Today's Revenue</p>
                          <p className="text-sm font-semibold">{formatCurrency(dashboardData.stats.monthlyRevenue / 30)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Active Trips</p>
                          <p className="text-sm font-semibold">{dashboardData.statusBreakdown.in_transit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-sm font-semibold">{dashboardData.statusBreakdown.pending}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Efficiency</p>
                          <p className="text-sm font-semibold">
                            {Math.round((dashboardData.stats.completedEntries / dashboardData.stats.totalEntries) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                  <Button asChild size="lg" className="w-full justify-center shadow-md hover:shadow-lg transition-shadow">
                    <Link href="/entry">
                      <Plus className="h-5 w-5 mr-2" />
                      New Entry
                    </Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +{Math.round(((dashboardData.stats.thisMonthEntries - dashboardData.stats.lastMonthEntries) / dashboardData.stats.lastMonthEntries) * 100)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue/Trip</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.avgRevenuePerTrip)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transport entry
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((dashboardData.stats.completedEntries / dashboardData.stats.totalEntries) * 100)}%
                </div>
                <Progress
                  value={(dashboardData.stats.completedEntries / dashboardData.stats.totalEntries) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.activeVehicles}</div>
                <p className="text-xs text-muted-foreground">
                  All operational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.thisMonthEntries}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(dashboardData.stats.monthlyRevenue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Entries */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Entries
                      </CardTitle>
                      <CardDescription>Latest transport entries and their status</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/entry">
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentEntries.map((entry) => (
                      <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{entry.id}</p>
                            <p className="text-xs text-muted-foreground truncate">{entry.vehicle}</p>
                            <p className="text-xs text-muted-foreground truncate">{entry.route}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-medium text-sm">{formatCurrency(entry.amount)}</p>
                          <div className="mt-1">
                            {getStatusBadge(entry.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview & Quick Actions */}
            <div className="space-y-6">
              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Overview
                  </CardTitle>
                  <CardDescription>Current status of all entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{dashboardData.statusBreakdown.completed}</span>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((dashboardData.statusBreakdown.completed / dashboardData.stats.totalEntries) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{dashboardData.statusBreakdown.pending}</span>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((dashboardData.statusBreakdown.pending / dashboardData.stats.totalEntries) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">In Transit</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{dashboardData.statusBreakdown.in_transit}</span>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((dashboardData.statusBreakdown.in_transit / dashboardData.stats.totalEntries) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    <Button asChild className="justify-start">
                      <Link href="/entry">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Entry
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/analysis">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/reports">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Update Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analytics & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Top Routes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Top Routes
                </CardTitle>
                <CardDescription>Most profitable routes this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{route.route}</p>
                          <p className="text-xs text-muted-foreground">{route.trips} trips • {route.distance}km</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(route.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {route.avgDays}d avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehicle Performance
                </CardTitle>
                <CardDescription>Top performing vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.vehiclePerformance.map((vehicle, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{vehicle.vehicle}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.trips} trips • {formatCurrency(vehicle.revenue)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={vehicle.efficiency >= 90 ? "default" : "secondary"}>
                            {vehicle.efficiency}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={vehicle.efficiency} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Trend
                </CardTitle>
                <CardDescription>Revenue trend over last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.monthlyTrend.map((month, index) => {
                    const maxRevenue = Math.max(...dashboardData.monthlyTrend.map(m => m.revenue))
                    const percentage = (month.revenue / maxRevenue) * 100
                    const isCurrentMonth = index === dashboardData.monthlyTrend.length - 1

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-8">{month.month}</span>
                            <span className="text-xs text-muted-foreground">{month.entries} entries</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(month.revenue)}</p>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          className={cn("h-2", isCurrentMonth && "bg-primary/20")}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile & Bank Summary */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Summary
                </CardTitle>
                <CardDescription>Your business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner</p>
                    <p className="text-sm font-medium truncate">{user?.profile?.ownerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Company</p>
                    <p className="text-sm font-medium truncate">{user?.profile?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Mobile</p>
                    <p className="text-sm font-medium truncate">{user?.profile?.mobileNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">GST</p>
                    <p className="text-sm font-medium truncate">{user?.profile?.gstNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <ProfileShareModal />
                </div>
              </CardContent>
            </Card>

            {/* Bank Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Information
                </CardTitle>
                <CardDescription>Your payment details</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.bank && user.bank.bankName ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Bank</p>
                        <p className="text-sm font-medium truncate">{user.bank.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Account</p>
                        <p className="text-sm font-medium truncate">****{user.bank.accountNumber?.slice(-4) || '****'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">IFSC</p>
                        <p className="text-sm font-medium truncate">{user.bank.ifscCode || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Branch</p>
                        <p className="text-sm font-medium truncate">{user.bank.bankBranchName || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <BankShareModal />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No banking information</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your bank details to receive payments
                    </p>
                    <Button asChild>
                      <Link href="/profile">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank Details
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}