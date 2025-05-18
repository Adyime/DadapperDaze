import Link from "next/link"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/db"

interface AdminCouponsListProps {
  query: string
  page: number
}

export default async function AdminCouponsList({ query, page }: AdminCouponsListProps) {
  const limit = 10
  const skip = (page - 1) * limit

  const where = query
    ? {
        OR: [
          { code: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }
    : {}

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

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
          {coupons.map((coupon) => (
            <div key={coupon.id} className="grid grid-cols-5 p-4 items-center">
              <div>
                <div className="font-medium">{coupon.code}</div>
                {coupon.description && (
                  <div className="text-sm text-muted-foreground truncate">{coupon.description}</div>
                )}
              </div>
              <div>
                {coupon.discountType === "PERCENTAGE" ? (
                  <span>{coupon.discountValue}%</span>
                ) : (
                  <span>{formatPrice(coupon.discountValue)}</span>
                )}
                {coupon.minOrderValue && (
                  <div className="text-sm text-muted-foreground">
                    Min. order: {formatPrice(coupon.minOrderValue)}
                  </div>
                )}
                {coupon.maxDiscount && (
                  <div className="text-sm text-muted-foreground">
                    Max. discount: {formatPrice(coupon.maxDiscount)}
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div>{format(coupon.startDate, "MMM d, yyyy")}</div>
                <div className="text-muted-foreground">to {format(coupon.endDate, "MMM d, yyyy")}</div>
                {coupon.usageLimit && (
                  <div className="text-muted-foreground">
                    Used: {coupon.usedCount}/{coupon.usageLimit}
                  </div>
                )}
              </div>
              <div>
                {coupon.isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/coupons/${coupon.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}

          {coupons.length === 0 && <div className="p-4 text-center text-muted-foreground">No coupons found.</div>}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/admin/coupons",
                  query: {
                    ...(query ? { q: query } : {}),
                    page: page - 1,
                  },
                }}
              >
                Previous
              </Link>
            </Button>
          )}
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/admin/coupons",
                  query: {
                    ...(query ? { q: query } : {}),
                    page: page + 1,
                  },
                }}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
