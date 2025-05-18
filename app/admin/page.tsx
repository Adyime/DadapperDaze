// "use client"

import { Suspense } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats, getMonthlySalesData } from "@/lib/admin"
import AdminDashboardChart from "@/components/admin/admin-dashboard-chart"
import TopProductsList from "@/components/admin/top-products-list"

export default async function AdminDashboardPage() {
  // Fetch the sales data
  const salesData = await getMonthlySalesData()
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <AdminDashboardChart data={salesData} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TopProductsListSkeleton />}>
              <TopProductsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function StatCards() {
  const stats = await getDashboardStats()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueChange > 0 ? "+" : ""}
            {stats.revenueChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.ordersChange > 0 ? "+" : ""}
            {stats.ordersChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.usersChange > 0 ? "+" : ""}
            {stats.usersChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.productsChange > 0 ? "+" : ""}
            {stats.productsChange}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

function TopProductsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 ml-auto" />
          </div>
        ))}
    </div>
  )
}
