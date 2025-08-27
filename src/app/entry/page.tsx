"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  MapPin,
  FileText,
  User,
  CreditCard
} from "lucide-react"
import { TransportBill, TransportBillFormData, BillStatus } from "@/lib/transport-types"
import { apiClient } from "@/lib/api"

// Helper function to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  if (typeof window === 'undefined') {
    // Server-side: return a static date to avoid hydration mismatch
    return '2024-01-01'
  }
  // Client-side: return actual today's date
  return new Date().toISOString().split('T')[0]
}

// Helper function to safely format dates
const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
  } catch (error) {
    return 'Invalid Date'
  }
}

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

// Helper function to convert API response to proper TransportBill objects
const convertApiResponseToTransportBill = (apiData: any): TransportBill => {
  return {
    ...apiData,
    id: apiData.id, // Custom unique ID (e.g., TE-20250730-0001)
    _id: apiData._id, // MongoDB ObjectId for delete operations
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

function TransportEntriesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode') // 'view' or 'edit'
  const entryId = searchParams.get('id')
  const [entries, setEntries] = useState<TransportBill[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TransportBill | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<TransportBill | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("")

  // Form data state - initialize with static values to prevent hydration mismatch
  const [formData, setFormData] = useState<TransportBillFormData>({
    date: getTodayString(),
    vehicleNo: "",
    from: "",
    to: "",
    transportBillData: {
      bill: 0,
      ms: "",
      gstno: "",
      otherDetail: "",
      srno: 0,
      lrno: 0,
      lrDate: getTodayString(),
      invoiceNo: "",
      consignorConsignee: "",
      handleCharges: 0,
      detention: 0,
      freight: 0,
      total: 0,
      status: BillStatus.PENDING
    },
    ownerData: {
      contactNo: 0,
      ownerNameAndAddress: "",
      panNo: "",
      driverNameAndMob: "",
      licenceNo: "",
      chasisNo: "",
      engineNo: "",
      insuranceCo: "",
      policyNo: "",
      policyDate: getTodayString(),
      srno: 0,
      lrno: 0,
      packages: 0,
      description: "",
      wtKgs: 0,
      remarks: "",
      brokerName: "",
      brokerPanNo: "",
      lorryHireAmount: 0,
      accNo: 0,
      otherChargesHamliDetentionHeight: 0,
      totalLorryHireRs: 0,
      advAmt1: 0,
      advDate1: getTodayString(),
      neftImpsIdno1: "",
      advAmt2: 0,
      advDate2: getTodayString(),
      neftImpsIdno2: "",
      advAmt3: 0,
      advDate3: getTodayString(),
      neftImpsIdno3: "",
      balanceAmt: 0,
      otherChargesHamaliDetentionHeight: "",
      deductionInClaimPenalty: "",
      finalNeftImpsIdno: "",
      finalDate: getTodayString(),
      deliveryDate: getTodayString()
    }
  })

  // Set mounted flag and update dates to current date after hydration
  useEffect(() => {
    setMounted(true)
    const today = new Date().toISOString().split('T')[0]
    const currentFY = getCurrentFinancialYear()
    setSelectedFinancialYear(currentFY)
    setFormData(prev => ({
      ...prev,
      date: today,
      transportBillData: {
        ...prev.transportBillData,
        lrDate: today
      },
      ownerData: {
        ...prev.ownerData,
        policyDate: today,
        advDate1: today,
        advDate2: today,
        advDate3: today,
        finalDate: today,
        deliveryDate: today
      }
    }))
  }, [])

  // Handle URL-based view/edit modes
  useEffect(() => {
    if (mode && entryId) {
      // Find the entry by ID
      const entry = entries.find(e => (e.id || e._id) === entryId)
      if (entry) {
        setSelectedEntry(entry)
        if (mode === 'view') {
          setIsViewDialogOpen(true)
        } else if (mode === 'edit') {
          handleEdit(entry)
        }
      } else if (entries.length > 0) {
        // Entry not found, redirect back to reports
        router.push('/reports')
      }
    }
  }, [mode, entryId, entries, router])

  // Handle dialog close - clear URL parameters
  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setIsViewDialogOpen(false)
    setSelectedEntry(null)
    resetForm()
    // Clear URL parameters
    router.push('/entry')
  }  // Reset form data
  const resetForm = () => {
    const today = mounted ? new Date().toISOString().split('T')[0] : getTodayString()
    setFormData({
      date: today,
      vehicleNo: "",
      from: "",
      to: "",
      transportBillData: {
        bill: 0,
        ms: "",
        gstno: "",
        otherDetail: "",
        srno: 0,
        lrno: 0,
        lrDate: today,
        invoiceNo: "",
        consignorConsignee: "",
        handleCharges: 0,
        detention: 0,
        freight: 0,
        total: 0,
        status: BillStatus.PENDING
      },
      ownerData: {
        contactNo: 0,
        ownerNameAndAddress: "",
        panNo: "",
        driverNameAndMob: "",
        licenceNo: "",
        chasisNo: "",
        engineNo: "",
        insuranceCo: "",
        policyNo: "",
        policyDate: today,
        srno: 0,
        lrno: 0,
        packages: 0,
        description: "",
        wtKgs: 0,
        remarks: "",
        brokerName: "",
        brokerPanNo: "",
        lorryHireAmount: 0,
        accNo: 0,
        otherChargesHamliDetentionHeight: 0,
        totalLorryHireRs: 0,
        advAmt1: 0,
        advDate1: today,
        neftImpsIdno1: "",
        advAmt2: 0,
        advDate2: today,
        neftImpsIdno2: "",
        advAmt3: 0,
        advDate3: today,
        neftImpsIdno3: "",
        balanceAmt: 0,
        otherChargesHamaliDetentionHeight: "",
        deductionInClaimPenalty: "",
        finalNeftImpsIdno: "",
        finalDate: today,
        deliveryDate: today
      }
    })
    setEditingEntry(null)
  }

  // Fetch entries from API
  const fetchEntries = async () => {
    setIsLoadingList(true)
    setError("")

    try {
      const response = await apiClient.getTransportEntries({
        search: searchTerm,
        limit: 10 // Limit to last 10 entries
      })

      if (response.success && response.data) {
        // Convert API response to proper TransportBill objects with Date objects
        const convertedEntries = (response.data.entries || []).map(convertApiResponseToTransportBill)

        // Filter by selected financial year if specified
        const filteredByFY = selectedFinancialYear && selectedFinancialYear !== "all" ?
          convertedEntries.filter(entry => {
            const entryFY = getFinancialYear(entry.date)
            return entryFY === selectedFinancialYear
          }) : convertedEntries

        setEntries(filteredByFY)
      } else {
        setError(response.error || "Failed to fetch entries")
      }
    } catch (error) {
      setError("Failed to fetch entries")
    } finally {
      setIsLoadingList(false)
    }
  }

  // Load entries on component mount and when search term or financial year changes
  useEffect(() => {
    fetchEntries()
  }, [searchTerm, selectedFinancialYear])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const billData: TransportBill = {
        ...formData,
        date: new Date(formData.date),
        transportBillData: {
          ...formData.transportBillData,
          lrDate: new Date(formData.transportBillData.lrDate)
        },
        ownerData: {
          ...formData.ownerData,
          policyDate: new Date(formData.ownerData.policyDate),
          advDate1: new Date(formData.ownerData.advDate1),
          advDate2: new Date(formData.ownerData.advDate2),
          advDate3: new Date(formData.ownerData.advDate3),
          finalDate: new Date(formData.ownerData.finalDate),
          deliveryDate: new Date(formData.ownerData.deliveryDate)
        }
      }

      let response;
      if (editingEntry) {
        // Update existing entry
        response = await apiClient.updateTransportEntry(editingEntry._id!, billData)
        if (response.success) {
          setSuccess("Transport entry updated successfully!")
          await fetchEntries() // Refresh the list
        } else {
          setError(response.error || "Failed to update entry")
          return
        }
      } else {
        // Create new entry
        response = await apiClient.createTransportEntry(billData)
        if (response.success) {
          setSuccess("Transport entry created successfully!")
          await fetchEntries() // Refresh the list
        } else {
          setError(response.error || "Failed to create entry")
          return
        }
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      setError("Failed to save transport entry")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to safely convert date to string
  const dateToString = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toISOString().split('T')[0]
    } catch (error) {
      return getTodayString()
    }
  }

  // Handle edit
  const handleEdit = (entry: TransportBill) => {
    setEditingEntry(entry)
    setFormData({
      date: dateToString(entry.date),
      vehicleNo: entry.vehicleNo,
      from: entry.from,
      to: entry.to,
      transportBillData: {
        ...entry.transportBillData,
        lrDate: dateToString(entry.transportBillData.lrDate)
      },
      ownerData: {
        ...entry.ownerData,
        policyDate: dateToString(entry.ownerData.policyDate),
        advDate1: dateToString(entry.ownerData.advDate1),
        advDate2: dateToString(entry.ownerData.advDate2),
        advDate3: dateToString(entry.ownerData.advDate3),
        finalDate: dateToString(entry.ownerData.finalDate),
        deliveryDate: dateToString(entry.ownerData.deliveryDate)
      }
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (entryId: string) => {
    setError("")
    setSuccess("")

    try {
      const response = await apiClient.deleteTransportEntry(entryId)
      if (response.success) {
        setSuccess("Transport entry deleted successfully!")
        await fetchEntries() // Refresh the list
      } else {
        setError(response.error || "Failed to delete entry")
      }
    } catch (error) {
      setError("Failed to delete entry")
    }
  }

  // Filter entries
  const filteredEntries = entries.filter(entry =>
    entry.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transportBillData.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  )
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-6 w-6 sm:h-8 sm:w-8" />
              Transport Entries
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
              Manage transport entries with owner and transport details
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose()
            else setIsDialogOpen(true)
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add New Entry</span>
                <span className="sm:hidden">Add Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Transport Entry" : "Add New Transport Entry"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the transport and owner details for the entry
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date *</label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Vehicle No *</label>
                        <Input
                          value={formData.vehicleNo}
                          onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                          placeholder="MH12AB1234"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">From *</label>
                        <Input
                          value={formData.from}
                          onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">To *</label>
                        <Input
                          value={formData.to}
                          onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                          placeholder="Delhi"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Tabs for Transport and Owner Data */}
                <Tabs defaultValue="transport" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transport" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Transport Details
                    </TabsTrigger>
                    <TabsTrigger value="owner" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Owner Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Transport Details Tab */}
                  <TabsContent value="transport" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Transport Bill Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Bill No</label>
                            <Input
                              type="number"
                              value={formData.transportBillData.bill}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, bill: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">MS</label>
                            <Input
                              value={formData.transportBillData.ms}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, ms: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">GST No</label>
                            <Input
                              value={formData.transportBillData.gstno}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, gstno: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">SR No</label>
                            <Input
                              type="number"
                              value={formData.transportBillData.srno}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, srno: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">LR No</label>
                            <Input
                              type="number"
                              value={formData.transportBillData.lrno}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, lrno: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">LR Date</label>
                            <Input
                              type="date"
                              value={formData.transportBillData.lrDate}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, lrDate: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Invoice No</label>
                            <Input
                              value={formData.transportBillData.invoiceNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, invoiceNo: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Consignor/Consignee</label>
                          <Input
                            value={formData.transportBillData.consignorConsignee}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              transportBillData: { ...prev.transportBillData, consignorConsignee: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Handle Charges</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.transportBillData.handleCharges}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, handleCharges: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Detention</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.transportBillData.detention}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, detention: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Freight</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.transportBillData.freight}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, freight: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Total</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.transportBillData.total}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, total: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Select
                              value={formData.transportBillData.status}
                              onValueChange={(value: BillStatus) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, status: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={BillStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={BillStatus.IN_PROGRESS}>In Progress</SelectItem>
                                <SelectItem value={BillStatus.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={BillStatus.CANCELLED}>Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Other Details</label>
                            <Textarea
                              value={formData.transportBillData.otherDetail}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportBillData: { ...prev.transportBillData, otherDetail: e.target.value }
                              }))}
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Owner Details Tab */}
                  <TabsContent value="owner" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Owner Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Contact No</label>
                            <Input
                              type="number"
                              value={formData.ownerData.contactNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, contactNo: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">PAN No</label>
                            <Input
                              value={formData.ownerData.panNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, panNo: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Owner Name & Address</label>
                          <Textarea
                            value={formData.ownerData.ownerNameAndAddress}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              ownerData: { ...prev.ownerData, ownerNameAndAddress: e.target.value }
                            }))}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Driver Name & Mobile</label>
                            <Input
                              value={formData.ownerData.driverNameAndMob}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, driverNameAndMob: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Licence No</label>
                            <Input
                              value={formData.ownerData.licenceNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, licenceNo: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Chassis No</label>
                            <Input
                              value={formData.ownerData.chasisNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, chasisNo: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Engine No</label>
                            <Input
                              value={formData.ownerData.engineNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, engineNo: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Insurance Co</label>
                            <Input
                              value={formData.ownerData.insuranceCo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, insuranceCo: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Policy No</label>
                            <Input
                              value={formData.ownerData.policyNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, policyNo: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Policy Date</label>
                            <Input
                              type="date"
                              value={formData.ownerData.policyDate}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, policyDate: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Shipment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">SR No</label>
                            <Input
                              type="number"
                              value={formData.ownerData.srno}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, srno: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">LR No</label>
                            <Input
                              type="number"
                              value={formData.ownerData.lrno}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, lrno: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Packages</label>
                            <Input
                              type="number"
                              value={formData.ownerData.packages}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, packages: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                              value={formData.ownerData.description}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, description: e.target.value }
                              }))}
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Weight (Kgs)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ownerData.wtKgs}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, wtKgs: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Remarks</label>
                          <Textarea
                            value={formData.ownerData.remarks}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              ownerData: { ...prev.ownerData, remarks: e.target.value }
                            }))}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Financial Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Broker Name</label>
                            <Input
                              value={formData.ownerData.brokerName}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, brokerName: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Broker PAN No</label>
                            <Input
                              value={formData.ownerData.brokerPanNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, brokerPanNo: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Lorry Hire Amount</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ownerData.lorryHireAmount}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, lorryHireAmount: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Account No</label>
                            <Input
                              type="number"
                              value={formData.ownerData.accNo}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, accNo: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Other Charges</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ownerData.otherChargesHamliDetentionHeight}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, otherChargesHamliDetentionHeight: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Total Lorry Hire Rs</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ownerData.totalLorryHireRs}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, totalLorryHireRs: Number(e.target.value) }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Balance Amount</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ownerData.balanceAmt}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                ownerData: { ...prev.ownerData, balanceAmt: Number(e.target.value) }
                              }))}
                            />
                          </div>
                        </div>

                        {/* Advance Payments */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Advance Payments</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Amount 1</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.ownerData.advAmt1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advAmt1: Number(e.target.value) }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Date 1</label>
                              <Input
                                type="date"
                                value={formData.ownerData.advDate1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advDate1: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">NEFT/IMPS ID 1</label>
                              <Input
                                value={formData.ownerData.neftImpsIdno1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, neftImpsIdno1: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Amount 2</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.ownerData.advAmt2}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advAmt2: Number(e.target.value) }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Date 2</label>
                              <Input
                                type="date"
                                value={formData.ownerData.advDate2}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advDate2: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">NEFT/IMPS ID 2</label>
                              <Input
                                value={formData.ownerData.neftImpsIdno2}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, neftImpsIdno2: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Amount 3</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.ownerData.advAmt3}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advAmt3: Number(e.target.value) }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Advance Date 3</label>
                              <Input
                                type="date"
                                value={formData.ownerData.advDate3}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, advDate3: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">NEFT/IMPS ID 3</label>
                              <Input
                                value={formData.ownerData.neftImpsIdno3}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, neftImpsIdno3: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Final Settlement */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Final Settlement</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Other Charges (Hamali/Detention/Height)</label>
                              <Input
                                value={formData.ownerData.otherChargesHamaliDetentionHeight}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, otherChargesHamaliDetentionHeight: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Deduction in Claim/Penalty</label>
                              <Input
                                value={formData.ownerData.deductionInClaimPenalty}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, deductionInClaimPenalty: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Final NEFT/IMPS ID</label>
                              <Input
                                value={formData.ownerData.finalNeftImpsIdno}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, finalNeftImpsIdno: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Final Date</label>
                              <Input
                                type="date"
                                value={formData.ownerData.finalDate}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, finalDate: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Delivery Date</label>
                              <Input
                                type="date"
                                value={formData.ownerData.deliveryDate}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ownerData: { ...prev.ownerData, deliveryDate: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        {editingEntry ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {editingEntry ? "Update Entry" : "Create Entry"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose()
            else setIsViewDialogOpen(true)
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>View Transport Entry</DialogTitle>
                <DialogDescription>
                  Transport entry details (Read-only)
                </DialogDescription>
              </DialogHeader>

              {selectedEntry && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Entry ID</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.id || selectedEntry._id}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Date</label>
                          <div className="p-2 bg-muted rounded">{formatDate(selectedEntry.date)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Vehicle No</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.vehicleNo}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Route</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.from} → {selectedEntry.to}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transport Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transport Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Bill No</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.transportBillData.bill}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Invoice No</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.transportBillData.invoiceNo}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Status</label>
                          <div className="p-2">
                            <Badge
                              variant={
                                selectedEntry.transportBillData.status === BillStatus.COMPLETED
                                  ? "default"
                                  : selectedEntry.transportBillData.status === BillStatus.IN_PROGRESS
                                    ? "secondary"
                                    : selectedEntry.transportBillData.status === BillStatus.CANCELLED
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {selectedEntry.transportBillData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Handle Charges</label>
                          <div className="p-2 bg-muted rounded">₹{selectedEntry.transportBillData.handleCharges.toLocaleString()}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Detention</label>
                          <div className="p-2 bg-muted rounded">₹{selectedEntry.transportBillData.detention.toLocaleString()}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Freight</label>
                          <div className="p-2 bg-muted rounded">₹{selectedEntry.transportBillData.freight.toLocaleString()}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Total</label>
                          <div className="p-2 bg-muted rounded font-semibold">₹{selectedEntry.transportBillData.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Owner Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Owner Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Owner Name & Address</label>
                          <div className="p-2 bg-muted rounded whitespace-pre-line">{selectedEntry.ownerData.ownerNameAndAddress}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Contact No</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.ownerData.contactNo}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Driver Name & Mobile</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.ownerData.driverNameAndMob}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Broker Name</label>
                          <div className="p-2 bg-muted rounded">{selectedEntry.ownerData.brokerName}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleDialogClose}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      handleDialogClose()
                      handleEdit(selectedEntry)
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Entry
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle no, route, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mobile-input"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={selectedFinancialYear}
                  onValueChange={setSelectedFinancialYear}
                >
                  <SelectTrigger className="mobile-input">
                    <SelectValue placeholder="Select Financial Year" />
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
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" asChild className="mobile-button">
                  <a href="/reports">
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </a>
                </Button>
                <Button variant="outline" asChild className="mobile-button">
                  <a href="/analysis">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Analysis
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>        {
/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>Transport Entries</CardTitle>
            <CardDescription>
              {isLoadingList ? "Loading..." : `${filteredEntries.length} entr${filteredEntries.length !== 1 ? 'ies' : 'y'} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading entries...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transport entries found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first transport entry to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entry ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vehicle No</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{entry.id || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(entry.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {entry.vehicleNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {entry.from} → {entry.to}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {entry.transportBillData.invoiceNo || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.transportBillData.status === BillStatus.COMPLETED
                                ? "default"
                                : entry.transportBillData.status === BillStatus.IN_PROGRESS
                                  ? "secondary"
                                  : entry.transportBillData.status === BillStatus.CANCELLED
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {entry.transportBillData.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            ₹{entry.transportBillData.total.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function TransportEntriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransportEntriesPageContent />
    </Suspense>
  )
}