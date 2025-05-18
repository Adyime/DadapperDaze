import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import CouponForm from "@/components/admin/coupon-form"

export const metadata: Metadata = {
  title: "New Coupon",
  description: "Create a new coupon code",
}

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">New Coupon</h1>
        <p className="text-muted-foreground">Create a new coupon code for your store.</p>
      </div>

      <CouponForm />
    </div>
  )
} 