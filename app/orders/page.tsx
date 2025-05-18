import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { PackageOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/session"
import { getUserOrders } from "@/lib/orders"
import OrderCard from "@/components/order-card"

export const metadata: Metadata = {
  title: "Your Orders",
  description: "View your order history",
}

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/orders")
  }

  const orders = await getUserOrders(user.id)
  const isEmpty = orders.length === 0

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Button asChild size="lg">
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
