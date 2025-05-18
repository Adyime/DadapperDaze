import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "User Details",
  description: "View user details and orders",
}

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Details</h1>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-medium">
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{user.name || "No name"}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Member Since:</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Orders:</span>
                <span>{user._count.orders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest purchase history</CardDescription>
              </div>
              {user._count.orders > 0 && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/orders?userId=${user.id}`}>View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {user.orders.length > 0 ? (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <div className="font-medium">Order #{order.id.substring(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-right">${order.total.toFixed(2)}</div>
                      <div className="text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No orders found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 