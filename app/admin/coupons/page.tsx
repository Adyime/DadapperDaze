import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import AdminCouponsList from "@/components/admin/admin-coupons-list"

export default function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ""
  const page = Number(searchParams.page) || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <form className="flex-1 max-w-sm">
          <div className="relative">
            <Input placeholder="Search coupons..." name="q" defaultValue={query} className="pr-10" />
            <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
              Search
            </Button>
          </div>
        </form>
      </div>

      <Suspense fallback={<CouponsListSkeleton />}>
        <AdminCouponsList query={query} page={page} />
      </Suspense>
    </div>
  )
}

function CouponsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-5 p-4 bg-muted/50">
          <div>Code</div>
          <div>Discount</div>
          <div>Validity</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 p-4 items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
