"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CartSummaryProps {
  cart: {
    id: string
    userId: string
    items: Array<{
      id: string
      quantity: number
      product: {
        name: string
        price: number
        discountedPrice: number | null
      }
      variant: {
        color: string
        size: string
      }
    }>
    subtotal: number
    total: number
  }
}

// Define the coupon data structure
interface CouponData {
  coupon: {
    id: string
    code: string
    discountType: string
    discountValue: number
  }
  discount: number
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)

  // Load the coupon from local storage on component mount
  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon')
    if (savedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon) as CouponData
        setAppliedCoupon(couponData)
        setDiscount(couponData.discount)
        
        // Revalidate the coupon silently to ensure it's still valid with current cart
        revalidateCoupon(couponData.coupon.code, true)
      } catch (error) {
        console.error("Error parsing saved coupon:", error)
        localStorage.removeItem('appliedCoupon')
      }
    }
  }, [cart.subtotal])

  // Function to revalidate a coupon code
  async function revalidateCoupon(code: string, silent = false) {
    if (!silent) setIsApplying(true)
    setCouponError(null)

    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal: cart.subtotal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (!silent) {
          setCouponError(data.error || "Invalid coupon code")
        } else {
          // If silent and error, remove the invalid coupon
          localStorage.removeItem('appliedCoupon')
          setAppliedCoupon(null)
          setDiscount(0)
        }
        return
      }

      setAppliedCoupon(data)
      setDiscount(data.discount)

      // Save the coupon to localStorage
      localStorage.setItem('appliedCoupon', JSON.stringify(data))

      if (!silent) {
        toast({
          title: "Coupon applied",
          description: `Discount: ${formatPrice(data.discount)}`,
        })
      }
    } catch (error: any) {
      if (!silent) {
        setCouponError(error.message || "Could not apply coupon")
      }
    } finally {
      if (!silent) setIsApplying(false)
    }
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault()

    if (!couponCode.trim()) return
    
    await revalidateCoupon(couponCode)
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode("")
    setCouponError(null)
    localStorage.removeItem('appliedCoupon')
  }

  const total = cart.subtotal - discount

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      {/* Items breakdown */}
      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Items in your cart:</p>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.quantity} × {item.product.name} <span className="text-muted-foreground">({item.variant.color} - {item.variant.size})</span>
            </span>
            <span>{formatPrice((item.product.discountedPrice || item.product.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t my-2"></div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-muted p-2 rounded-md">
            <div>
              <p className="text-sm font-medium">{appliedCoupon.coupon.code}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(discount)} discount</p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeCoupon}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <form onSubmit={applyCoupon} className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value)
                  setCouponError(null) // Clear error when typing
                }}
                className="flex-1"
              />
              <Button type="submit" variant="outline" disabled={isApplying}>
                Apply
              </Button>
            </form>
            
            {couponError && (
              <Alert variant="destructive" className="py-2 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{couponError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button asChild className="w-full">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
    </div>
  )
}
