"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { PageHeader, PageHeaderActions, PageHeaderPrimaryAction, PageHeaderSecondaryActions } from "@/components/ui/page-header"
import { MobileStatsGrid, MobileContentGrid, MobileCardGrid } from "@/components/ui/mobile-grid"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Truck,
  MapPin,
  CreditCard,
  Target,
  Activity,
  PieChart,
  Download,
  Users,
  Filter,
  Settings
} from "lucide-react"
import { TransportBill, BillStatus } from "@/lib/transport-types"
import { apiClient } from "@/lib/api"

// Helper function to get financial year from date
const getFinancialYear = (date = new Date()) => {
  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1

  if (currentMonth >= 4) {
    return `${currentYear}-${String(currentYear + 1).slice(-2)}`
  } else {
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`
  }
}

// Helper function to get current financial year
const getCurrentFinancialYear = () => {
  return getFinancialYear(new Date())
}

// Helper function to generate financial year options
const getFinancialYearOptions = () => {
  const currentFY = getCurrentFinancialYear()
  const currentYear = new Date().getFullYear()
  const options = []

  // Generate last 5 years and next 2 years
  for (let i = -5; i <= 2; i++) {
    const year = currentYear + i
    const fy = i >= 0 && new Date().getMonth() < 3 ?
      `${year - 1}-${String(year).slice(-2)}` :
      `${year}-${String(year + 1).slice(-2)}`
    options.push({
      value: fy,
      label: `FY ${fy}`,
      isCurrent: fy === currentFY
    })
  }

  return options.sort((a, b) => b.value.localeCompare(a.value))
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

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
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return months[monthIndex]
}

export default function AnalysisPage() {
  const [entries, setEntries] = useState<TransportBill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(getCurrentFinancialYear())

  // Fetch entries from API
  const fetchEntries = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.getTransportEntries({
        limit: 1000 // Get more entries for analysis
      })

      if (response.success && response.data) {
        const convertedEntries = (response.data.entries || []).map(convertApiResponseToTransportBill)
        setEntries(convertedEntries)
      } else {
        setError(response.error || "Failed to fetch entries")
      }
    } catch (error) {
      setError("Failed to fetch entries")
    } finally {
      setIsLoading(false)
    }
  }

  // Load entries on component mount
  useEffect(() => {
    fetchEntries()
  }, [])

  // Export analysis data to CSV
  const exportAnalysisData = () => {
    const analysisData = [
      ['Analysis Report', `FY ${selectedFinancialYear || 'All Years'}`],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Key Metrics'],
      ['Total Entries', analytics.totalEntries],
      ['Total Revenue', analytics.totalRevenue],
      ['Average Revenue', analytics.averageRevenue.toFixed(2)],
      ['Completion Rate', `${analytics.completionRate.toFixed(1)}%`],
      [''],
      ['Status Distribution'],
      ...Object.entries(analytics.statusDistribution).map(([status, count]) => [
        status.replace('_', ' '),
        count,
        `${((count / analytics.totalEntries) * 100).toFixed(1)}%`
      ]),
      [''],
      ['Top Routes by Revenue'],
      ['Route', 'Trips', 'Revenue'],
      ...analytics.routeAnalysis.map(route => [
        route.route,
        route.count,
        route.revenue
      ]),
      [''],
      ['Top Vehicles by Trips'],
      ['Vehicle', 'Trips', 'Revenue'],
      ...analytics.vehicleAnalysis.map(vehicle => [
        vehicle.vehicle,
        vehicle.count,
        vehicle.revenue
      ])
    ]

    const csvContent = analysisData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transport-analysis-${selectedFinancialYear || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter entries by selected financial year
  const filteredEntries = entries.filter(entry => {
    if (selectedFinancialYear === "all") return true
    return getFinancialYear(entry.date) === selectedFinancialYear
  })

  // Calculate analytics data
  const analytics = {
    // Basic metrics
    totalEntries: filteredEntries.length,
    totalRevenue: filteredEntries.reduce((sum, entry) => sum + entry.transportBillData.total, 0),
    averageRevenue: filteredEntries.length > 0 ?
      filteredEntries.reduce((sum, entry) => sum + entry.transportBillData.total, 0) / filteredEntries.length : 0,

    // Status distribution
    statusDistribution: filteredEntries.reduce((acc, entry) => {
      acc[entry.transportBillData.status] = (acc[entry.transportBillData.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),

    // Top routes
    routeAnalysis: Object.entries(
      filteredEntries.reduce((acc, entry) => {
        const route = `${entry.from} → ${entry.to}`
        if (!acc[route]) {
          acc[route] = { count: 0, revenue: 0 }
        }
        acc[route].count += 1
        acc[route].revenue += entry.transportBillData.total
        return acc
      }, {} as Record<string, { count: number; revenue: number }>)
    )
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),

    // Top vehicles
    vehicleAnalysis: Object.entries(
      filteredEntries.reduce((acc, entry) => {
        const vehicle = entry.vehicleNo
        if (!acc[vehicle]) {
          acc[vehicle] = { count: 0, revenue: 0 }
        }
        acc[vehicle].count += 1
        acc[vehicle].revenue += entry.transportBillData.total
        return acc
      }, {} as Record<string, { count: number; revenue: number }>)
    )
      .map(([vehicle, data]) => ({ vehicle, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),

    // Monthly trend (for current financial year)
    monthlyTrend: (() => {
      const monthlyData: Record<string, { count: number; revenue: number }> = {}

      filteredEntries.forEach(entry => {
        const month = entry.date.getMonth()
        const year = entry.date.getFullYear()
        const key = `${year}-${month}`

        if (!monthlyData[key]) {
          monthlyData[key] = { count: 0, revenue: 0 }
        }
        monthlyData[key].count += 1
        monthlyData[key].revenue += entry.transportBillData.total
      })

      return Object.entries(monthlyData)
        .map(([key, data]) => {
          const [year, month] = key.split('-')
          return {
            month: getMonthName(parseInt(month)),
            year: parseInt(year),
            ...data
          }
        })
        .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
        .slice(-12) // Last 12 months
    })(),

    // Performance metrics
    completionRate: filteredEntries.length > 0 ?
      (filteredEntries.filter(e => e.transportBillData.status === BillStatus.COMPLETED).length / filteredEntries.length) * 100 : 0,

    pendingRate: filteredEntries.length > 0 ?
      (filteredEntries.filter(e => e.transportBillData.status === BillStatus.PENDING).length / filteredEntries.length) * 100 : 0,

    // Growth metrics (comparing with previous period)
    growth: (() => {
      const currentPeriodEntries = filteredEntries.filter(entry => {
        const entryDate = entry.date
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return entryDate >= sixMonthsAgo
      })

      const previousPeriodEntries = filteredEntries.filter(entry => {
        const entryDate = entry.date
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return entryDate >= twelveMonthsAgo && entryDate < sixMonthsAgo
      })

      const currentRevenue = currentPeriodEntries.reduce((sum, entry) => sum + entry.transportBillData.total, 0)
      const previousRevenue = previousPeriodEntries.reduce((sum, entry) => sum + entry.transportBillData.total, 0)

      const revenueGrowth = previousRevenue > 0 ?
        ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

      const volumeGrowth = previousPeriodEntries.length > 0 ?
        ((currentPeriodEntries.length - previousPeriodEntries.length) / previousPeriodEntries.length) * 100 : 0

      return { revenueGrowth, volumeGrowth }
    })()
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
                Analysis
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
                Advanced analytics and business insights
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0">
            <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select FY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getFinancialYearOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} {option.isCurrent && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchEntries} disabled={isLoading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
            <Button
              onClick={() => exportAnalysisData()}
              disabled={filteredEntries.length === 0}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Analysis</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>


        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading analytics data...</span>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalEntries}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {analytics.growth.volumeGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {Math.abs(analytics.growth.volumeGrowth).toFixed(1)}% vs last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {analytics.growth.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {Math.abs(analytics.growth.revenueGrowth).toFixed(1)}% vs last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.averageRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per transport entry
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
                  <Progress value={analytics.completionRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                    const percentage = analytics.totalEntries > 0 ? (count / analytics.totalEntries) * 100 : 0
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Routes by Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.routeAnalysis.map((route, index) => (
                    <div key={route.route} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{route.route}</p>
                          <p className="text-xs text-muted-foreground">{route.count} trips</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(route.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Vehicle Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Top Performing Vehicles
                </CardTitle>
                <CardDescription>
                  Vehicles ranked by number of trips completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {analytics.vehicleAnalysis.map((vehicle, vehicleIndex) => (
                    <Card key={vehicle.vehicle}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{vehicle.vehicle}</span>
                          <span className="text-xs text-muted-foreground">#{vehicleIndex + 1}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{vehicle.count}</div>
                          <div className="text-xs text-muted-foreground">trips</div>
                          <div className="text-sm font-medium">{formatCurrency(vehicle.revenue)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            {analytics.monthlyTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Trend
                  </CardTitle>
                  <CardDescription>
                    Revenue and volume trends over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.monthlyTrend.map((month) => {
                      const maxRevenue = Math.max(...analytics.monthlyTrend.map(m => m.revenue))
                      const revenuePercentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0

                      return (
                        <div key={`${month.year}-${month.month}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 text-center">
                                <div className="text-sm font-medium">{month.month}</div>
                                <div className="text-xs text-muted-foreground">{month.year}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">{month.count} entries</div>
                                <div className="text-xs text-muted-foreground">
                                  Avg: {formatCurrency(month.revenue / month.count)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(month.revenue)}</div>
                            </div>
                          </div>
                          <Progress value={revenuePercentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Owner Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Owners by Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      filteredEntries.reduce((acc, entry) => {
                        const owner = entry.ownerData.ownerNameAndAddress.split('\n')[0] || 'Unknown'
                        if (!acc[owner]) {
                          acc[owner] = { count: 0, revenue: 0 }
                        }
                        acc[owner].count += 1
                        acc[owner].revenue += entry.transportBillData.total
                        return acc
                      }, {} as Record<string, { count: number; revenue: number }>)
                    )
                      .map(([owner, data]) => ({ owner, ...data }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((owner, ownerIndex) => (
                        <div key={owner.owner} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {ownerIndex + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm truncate max-w-32">{owner.owner}</p>
                              <p className="text-xs text-muted-foreground">{owner.count} trips</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatCurrency(owner.revenue)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion Rate</span>
                        <span>{analytics.completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.completionRate} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pending Rate</span>
                        <span>{analytics.pendingRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.pendingRate} className="[&>div]:bg-yellow-500" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.growth.revenueGrowth >= 0 ? '+' : ''}{analytics.growth.revenueGrowth.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Revenue Growth</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.growth.volumeGrowth >= 0 ? '+' : ''}{analytics.growth.volumeGrowth.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Volume Growth</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}