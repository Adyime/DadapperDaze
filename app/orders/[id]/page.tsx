import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/session"
import { getOrderById } from "@/lib/orders"
import { formatPrice, formatDate } from "@/lib/utils"
import OrderItemCard from "@/components/order-item-card"

type OrderPageProps = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  return {
    title: `Order #${params.id}`,
    description: "View your order details",
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/orders/" + params.id)
  }

  const order = await getOrderById(params.id, user.id)

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order #{order.id.slice(-6)}</h1>
        <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <OrderItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <address className="not-italic">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="capitalize">{order.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
