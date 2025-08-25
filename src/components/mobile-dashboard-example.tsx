"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MobileStatsGrid, MobileContentGrid, MobileCardGrid } from "@/components/ui/mobile-grid"
import { MobileTable } from "@/components/ui/table"
import {
  Truck,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Eye,
  Edit,
} from "lucide-react"

// Example mobile-optimized dashboard component
export default function MobileDashboardExample() {
  // Sample data
  const statsData = [
    {
      title: "Total Entries",
      value: "156",
      change: "+12%",
      icon: Package,
    },
    {
      title: "Revenue",
      value: "₹2,45,000",
      change: "+8%",
      icon: DollarSign,
    },
    {
      title: "Active Vehicles",
      value: "24",
      change: "0%",
      icon: Truck,
    },
    {
      title: "Completion Rate",
      value: "94%",
      change: "+2%",
      icon: CheckCircle,
    },
  ]

  const recentEntries = [
    {
      id: "TRN001",
      vehicle: "MH-12-AB-1234",
      route: "Mumbai → Delhi",
      status: "completed",
      amount: 15000,
      date: "2024-01-15",
    },
    {
      id: "TRN002",
      vehicle: "MH-12-CD-5678",
      route: "Delhi → Bangalore",
      status: "pending",
      amount: 18000,
      date: "2024-01-14",
    },
    {
      id: "TRN003",
      vehicle: "MH-12-EF-9012",
      route: "Bangalore → Chennai",
      status: "in_transit",
      amount: 12000,
      date: "2024-01-13",
    },
  ]

  const tableColumns = [
    {
      key: "id",
      label: "ID",
      mobileLabel: "Entry ID",
    },
    {
      key: "vehicle",
      label: "Vehicle",
      mobileLabel: "Vehicle No.",
    },
    {
      key: "route",
      label: "Route",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusColors = {
          completed: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          in_transit: "bg-blue-100 text-blue-800",
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
            {value.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost">
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back! Here's your transport business overview.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="mobile" className="sm:size-default">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
          <Button variant="outline" size="mobile" className="sm:size-default">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Mobile-optimized stats grid */}
      <MobileStatsGrid>
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </MobileStatsGrid>

      {/* Mobile-optimized content grid */}
      <MobileContentGrid>
        {/* Recent Entries - spans 2 columns on desktop */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Entries
                  </CardTitle>
                  <CardDescription>Latest transport entries and their status</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MobileTable data={recentEntries} columns={tableColumns} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - spans 1 column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Entry
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Truck className="h-4 w-4 mr-2" />
                Manage Vehicles
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileContentGrid>

      {/* Mobile-optimized card grid for additional content */}
      <MobileCardGrid>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Entries completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹85,000</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">On-time delivery</p>
          </CardContent>
        </Card>
      </MobileCardGrid>
    </div>
  )
}