import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { formatDate, formatPrice } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order Details",
  description: "View order details",
}

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/login")
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  function getOrderStatusBadge(status: string) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/users/${order.userId}`}>View Customer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Order #{order.id.substring(0, 8)}</CardDescription>
              </div>
              {getOrderStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Shipping:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>Customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {order.user.image ? (
                <Image
                  src={order.user.image}
                  alt={order.user.name || "Customer"}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {order.user.name?.charAt(0) || order.user.email.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{order.user.name || "No name"}</h3>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <div className="text-sm space-y-1">
                <p>{(order.shippingAddress as any).fullName}</p>
                <p>{(order.shippingAddress as any).streetAddress}</p>
                <p>
                  {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state}{" "}
                  {(order.shippingAddress as any).postalCode}
                </p>
                <p>{(order.shippingAddress as any).country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-muted flex items-center justify-center rounded">
                    <span className="text-xs text-center">Product Image</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Color: {item.variant.color}</p>
                      <p>Size: {item.variant.size}</p>
                      <p>SKU: {item.variant.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(item.price)}</div>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    <div className="font-medium mt-1">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 