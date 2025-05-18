import { Suspense } from "react"
import { format } from "date-fns"
import Link from "next/link"

import { prisma } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdersTableProps {
  userId?: string;
}

async function getOrders({ userId }: OrdersTableProps = {}) {
  const where = userId ? { userId } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
          variant: true,
        },
      },
    },
  })

  return orders
}

function OrderTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function OrderStatus({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          {status}
        </Badge>
      )
    case "PROCESSING":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {status}
        </Badge>
      )
    case "SHIPPED":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          {status}
        </Badge>
      )
    case "DELIVERED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          {status}
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge variant="destructive">
          {status}
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

async function OrdersTable({ userId }: OrdersTableProps = {}) {
  const orders = await getOrders({ userId })
  const filteringByUser = Boolean(userId)
  
  const user = filteringByUser 
    ? await prisma.user.findUnique({ 
        where: { id: userId },
        select: { name: true, email: true }
      })
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          {filteringByUser && user && (
            <p className="text-muted-foreground">
              Filtered by user: {user.name || user.email}
            </p>
          )}
        </div>
        {filteringByUser && (
          <Button asChild variant="outline">
            <Link href="/admin/orders">View All Orders</Link>
          </Button>
        )}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <OrderStatus status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function OrdersPage({
  searchParams,
}: {
  searchParams: { userId?: string }
}) {
  return (
    <div className="p-6">
      <Suspense fallback={<OrderTableSkeleton />}>
        <OrdersTable userId={searchParams.userId} />
      </Suspense>
    </div>
  )
} 