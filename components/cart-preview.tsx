"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"
import CartPreviewItem from "@/components/cart-preview-item"

export default function CartPreview() {
  const router = useRouter()
  const { data: session } = useSession()
  const [cart, setCart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCart() {
      if (!session) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/cart")

        if (!response.ok) {
          throw new Error("Failed to fetch cart")
        }

        const data = await response.json()
        setCart(data)
      } catch (error) {
        console.error("Error fetching cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [session])

  if (!session) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center mb-6">Sign in to view your cart and start shopping</p>
          <Button asChild>
            <Link href="/login?callbackUrl=/cart">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
        </div>

        <div className="py-4 space-y-4">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-semibold">Your Cart</h2>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center mb-6">Add items to your cart to see them here</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto py-4">
            <div className="space-y-4">
              {cart.items.map((item: any) => (
                <CartPreviewItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Shipping and taxes calculated at checkout</p>
            <Button asChild className="w-full">
              <Link href="/cart">View Cart</Link>
            </Button>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
