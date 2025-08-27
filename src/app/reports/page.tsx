"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { PageHeader, PageHeaderActions, PageHeaderPrimaryAction, PageHeaderSecondaryActions } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileTable } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MobileStatsGrid, MobileContentGrid, MobileCardGrid } from "@/components/ui/mobile-grid"
import { MobileSearch } from "@/components/ui/mobile-search"
import { MobileLoading, LoadingCard, MobileLoadingStates } from "@/components/ui/mobile-loading"
import { MobileError, ErrorStates } from "@/components/ui/mobile-error"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Truck,
  MapPin,
  User,
  CreditCard,
  RefreshCw,
  BarChart3,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Download
} from "lucide-react"
import { TransportBill, BillStatus } from "@/lib/transport-types"
import { apiClient } from "@/lib/api"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Checkbox } from "radix-ui"

// Helper functions
const getFinancialYear = (date = new Date()) => {
  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1
  
  if (currentMonth >= 4) {
    return `${currentYear}-${String(currentYear + 1).slice(-2)}`
  } else {
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`
  }
}

const getCurrentFinancialYear = () => getFinancialYear(new Date())

const getFinancialYearOptions = () => {
  const currentFY = getCurrentFinancialYear()
  const currentYear = new Date().getFullYear()
  const options = []

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

const formatDate = (date: string | Date) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

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

// Filter and sort options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: BillStatus.COMPLETED, label: 'Completed' },
  { value: BillStatus.PENDING, label: 'Pending' },
  { value: BillStatus.IN_PROGRESS, label: 'In Progress' },
  { value: BillStatus.CANCELLED, label: 'Cancelled' }
]

const sortOptions = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' },
  { value: 'vehicle', label: 'Vehicle Number' },
  { value: 'status', label: 'Status' }
]

export default function ReportsPage() {
  // State management
  const [entries, setEntries] = useState<TransportBill[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TransportBill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(getCurrentFinancialYear())
  const [sortBy, setSortBy] = useState("date-desc")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  
  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Router for navigation
  const router = useRouter()

  // Action handlers
  const handleView = (entry: TransportBill) => {
    // Navigate to entry page with view mode and entry ID
    router.push(`/entry?mode=view&id=${entry.id || entry._id}`)
  }

  const handleEdit = (entry: TransportBill) => {
    // Navigate to entry page with edit mode and entry ID
    router.push(`/entry?mode=edit&id=${entry.id || entry._id}`)
  }

  const handleDelete = async (entry: TransportBill) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return
    }

    const entryId = entry.id || entry._id
    setDeletingId(entryId)

    try {
      const response = await apiClient.deleteTransportEntry(entryId)
      
      if (response.success) {
        // Remove the entry from the local state
        setEntries(prev => prev.filter(e => (e.id || e._id) !== entryId))
        setFilteredEntries(prev => prev.filter(e => (e.id || e._id) !== entryId))
        
        // Show success message (you could use a toast notification here)
        alert('Entry deleted successfully!')
      } else {
        alert('Failed to delete entry: ' + (response.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Load entries from API
  const loadEntries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getTransportEntries({
        limit: 1000,
        financialYear: selectedFinancialYear
      })

      if (response.success && response.data) {
        const convertedEntries = (response.data.entries || []).map(convertApiResponseToTransportBill)
        setEntries(convertedEntries)
      } else {
        setError(response.error || "Failed to fetch entries")
      }
    } catch (error) {
      console.error('Error loading entries:', error)
      setError("Failed to load entries. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Load entries on mount and when financial year changes
  useEffect(() => {
    loadEntries()
  }, [selectedFinancialYear])

  // Filter and sort entries
  useEffect(() => {
    let filtered = [...entries]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.vehicleNo.toLowerCase().includes(query) ||
        entry.from.toLowerCase().includes(query) ||
        entry.to.toLowerCase().includes(query) ||
        entry.transportBillData.invoiceNo?.toLowerCase().includes(query) ||
        entry.ownerData.ownerNameAndAddress.toLowerCase().includes(query) ||
        (entry.id || entry._id || '').toLowerCase().includes(query)
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(entry => entry.transportBillData.status === selectedStatus)
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      filtered = filtered.filter(entry => {
        const entryDate = entry.date
        return entryDate >= fromDate && entryDate <= toDate
      })
    }

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.date.getTime() - a.date.getTime()
        case 'date-asc':
          return a.date.getTime() - b.date.getTime()
        case 'amount-desc':
          return b.transportBillData.total - a.transportBillData.total
        case 'amount-asc':
          return a.transportBillData.total - b.transportBillData.total
        case 'vehicle':
          return a.vehicleNo.localeCompare(b.vehicleNo)
        case 'status':
          return a.transportBillData.status.localeCompare(b.transportBillData.status)
        default:
          return 0
      }
    })

    setFilteredEntries(filtered)
  }, [entries, searchQuery, selectedStatus, dateRange, sortBy])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredEntries.length
    const completed = filteredEntries.filter(e => e.transportBillData.status === BillStatus.COMPLETED).length
    const pending = filteredEntries.filter(e => e.transportBillData.status === BillStatus.PENDING).length
    const inProgress = filteredEntries.filter(e => e.transportBillData.status === BillStatus.IN_PROGRESS).length
    const totalRevenue = filteredEntries.reduce((sum, entry) => sum + entry.transportBillData.total, 0)
    const avgRevenue = total > 0 ? totalRevenue / total : 0
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      pending,
      inProgress,
      totalRevenue,
      avgRevenue,
      completionRate
    }
  }, [filteredEntries])



  // Bulk actions
  const handleBulkAction = (action: 'delete' | 'export' | 'update-status') => {
    // Bulk action implementation would go here
    // Implement bulk actions here
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    setDateRange({ from: "", to: "" })
    setSortBy("date-desc")
    setShowFilters(false)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      [BillStatus.COMPLETED]: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      [BillStatus.PENDING]: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      [BillStatus.IN_PROGRESS]: { variant: 'outline' as const, icon: Truck, color: 'text-blue-600' },
      [BillStatus.CANCELLED]: { variant: 'destructive' as const, icon: X, color: 'text-red-600' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[BillStatus.PENDING]
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }



  // Table columns configuration
  const tableColumns = [
    {
      key: 'id',
      label: 'Entry ID',
      mobileLabel: 'ID',
      render: (value: string, row: TransportBill) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{row.id || row._id || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: Date) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'vehicleNo',
      label: 'Vehicle',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'route',
      label: 'Route',
      render: (value: string, row: TransportBill) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.from} → {row.to}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: TransportBill) => getStatusBadge(row.transportBillData.status)
    },
    {
      key: 'total',
      label: 'Amount',
      render: (value: number, row: TransportBill) => (
        <span className="font-semibold">{formatCurrency(row.transportBillData.total)}</span>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      mobileLabel: 'Owner',
      render: (value: string, row: TransportBill) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate max-w-32">
            {row.ownerData.ownerNameAndAddress.split('\n')[0] || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: TransportBill) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => handleView(row)}
            title="View Entry"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => handleEdit(row)}
            title="Edit Entry"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => handleDelete(row)}
            disabled={deletingId === (row.id || row._id)}
            title="Delete Entry"
          >
            {deletingId === (row.id || row._id) ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  ]

  // Page header stats
  const headerStats = [
    {
      label: "Total Entries",
      value: stats.total.toString(),
      icon: Package,
      color: 'blue' as const,
      trend: { value: "+12%", direction: 'up' as const }
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'green' as const,
      trend: { value: "+8%", direction: 'up' as const }
    },
    {
      label: "Completion Rate",
      value: `${Math.round(stats.completionRate)}%`,
      icon: CheckCircle,
      color: 'purple' as const,
      trend: { value: "+2%", direction: 'up' as const }
    },
    {
      label: "Avg Revenue",
      value: formatCurrency(stats.avgRevenue),
      icon: BarChart3,
      color: 'orange' as const,
      trend: { value: "0%", direction: 'neutral' as const }
    }
  ]

  // Loading state
  if (isLoading && entries.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <PageHeader
              variant="gradient"
              title="Reports"
              description="Loading your transport business reports..."
            />
            {MobileLoadingStates.stats()}
            <LoadingCard title="Loading entries..." />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <PageHeader
              variant="gradient"
              title="Reports"
              description="Generate and analyze your transport business reports"
            />
            {ErrorStates.generic(error, loadEntries)}
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>

        <div className="space-y-6">
          {/* Enhanced Page Header */}
          <PageHeader
            variant="gradient"
            title="Reports & Analytics"
            description={`Comprehensive analysis of your transport business data for FY ${selectedFinancialYear}`}
            stats={headerStats}
            actions={
              <PageHeaderActions>
                <PageHeaderSecondaryActions>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                  </Button>
                </PageHeaderSecondaryActions>
              </PageHeaderActions>
            }
          />

          {/* Filters Section */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters & Search</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Entries</label>
                  <MobileSearch
                    placeholder="Search by vehicle, route, invoice, or owner..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    suggestions={["Vehicle Number", "Route", "Invoice Number", "Owner Name"]}
                  />
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Financial Year */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Financial Year</label>
                    <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getFinancialYearOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} {option.isCurrent && "(Current)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">View Mode</label>
                    <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Table View</SelectItem>
                        <SelectItem value="cards">Card View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Date</label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To Date</label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



          {/* Results Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredEntries.length}</span> of{" "}
                    <span className="font-medium text-foreground">{entries.length}</span> entries
                  </div>
                  {(searchQuery || selectedStatus !== 'all' || dateRange.from || dateRange.to) && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedEntries.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedEntries.length} selected
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                        <Download className="h-4 w-4 mr-1" />
                        Export Selected
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadEntries}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">No Entries Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedStatus !== 'all' || dateRange.from || dateRange.to
                      ? "No entries match your current filters. Try adjusting your search criteria."
                      : "No transport entries found for the selected financial year."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {(searchQuery || selectedStatus !== 'all' || dateRange.from || dateRange.to) && (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="h-5 w-5 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => window.location.href = '/entry'}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Entry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transport Entries Report
                </CardTitle>
                <CardDescription>
                  Detailed view of all transport entries with filtering and sorting options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading entries...
                  </div>
                ) : (
                  <MobileTable
                    data={filteredEntries.map(entry => ({
                      ...entry,
                      id: entry.id || entry._id,
                      route: `${entry.from} → ${entry.to}`,
                      status: entry.transportBillData.status,
                      total: entry.transportBillData.total,
                      owner: entry.ownerData.ownerNameAndAddress.split('\n')[0] || 'N/A'
                    }))}
                    columns={tableColumns}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}