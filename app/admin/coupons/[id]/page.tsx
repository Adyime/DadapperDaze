import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import CouponForm from "@/components/admin/coupon-form"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Edit Coupon",
  description: "Edit an existing coupon code",
}

interface EditCouponPageProps {
  params: {
    id: string
  }
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
  })

  if (!coupon) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold">Edit Coupon</h1>
        <p className="text-muted-foreground">Make changes to your coupon code.</p>
      </div>

      <CouponForm initialData={coupon} />
    </div>
  )
} 