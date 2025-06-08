// "use client"

import { Suspense } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats, getMonthlySalesData } from "@/lib/admin";
import AdminDashboardChart from "@/components/admin/admin-dashboard-chart";
import TopProductsList from "@/components/admin/top-products-list";

export default async function AdminDashboardPage() {
  // Fetch the sales data
  const salesData = await getMonthlySalesData();

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome to your admin dashboard overview.
        </p>
      </div>

      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-heading font-bold">
              Sales Overview
            </CardTitle>
            <div className="text-sm text-muted-foreground">Last 12 months</div>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-[400px] flex items-center justify-center">
                  <Skeleton className="h-[350px] w-full" />
                </div>
              }
            >
              <div className="h-[400px]">
                <AdminDashboardChart data={salesData} />
              </div>
            </Suspense>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-heading font-bold">
              Top Products
            </CardTitle>
            <div className="text-sm text-muted-foreground">By revenue</div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TopProductsListSkeleton />}>
              <TopProductsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function StatCards() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div className="flex items-center mt-1">
            {stats.revenueChange > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {stats.revenueChange > 0 ? "+" : ""}
              {stats.revenueChange}% from last month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <div className="flex items-center mt-1">
            {stats.ordersChange > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {stats.ordersChange > 0 ? "+" : ""}
              {stats.ordersChange}% from last month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="flex items-center mt-1">
            {stats.usersChange > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {stats.usersChange > 0 ? "+" : ""}
              {stats.usersChange}% from last month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="flex items-center mt-1">
            {stats.productsChange > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {stats.productsChange > 0 ? "+" : ""}
              {stats.productsChange}% from last month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function TopProductsListSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
    </div>
  );
}
