import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { getUserCart } from "@/lib/cart"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/checkout")
  }

  const cart = await getUserCart(user.id)

  if (cart.items.length === 0) {
    redirect("/cart")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CheckoutForm user={user} />
        </div>

        <div>
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
