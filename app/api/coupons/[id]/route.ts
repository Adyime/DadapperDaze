import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET - Get coupon by ID (admin only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
}

// PUT - Update a coupon (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z
      .object({
        code: z.string().min(1, "Code is required").toUpperCase(),
        description: z.string().optional(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discountValue: z.number().positive("Discount value must be positive"),
        minOrderValue: z.number().positive("Minimum order value must be positive").optional(),
        maxDiscount: z.number().positive("Maximum discount must be positive").optional(),
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z.string().transform((str) => new Date(str)),
        usageLimit: z.number().int().positive("Usage limit must be a positive integer").optional(),
        isActive: z.boolean(),
      })
      .refine((data) => data.endDate > data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
      })
      .refine(
        (data) => {
          if (data.discountType === "PERCENTAGE") {
            return data.discountValue <= 100
          }
          return true
        },
        {
          message: "Percentage discount cannot exceed 100%",
          path: ["discountValue"],
        },
      )

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const couponData = validationResult.data

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    // Check if code is already used by another coupon
    if (couponData.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: {
          code: couponData.code,
          id: { not: params.id },
        },
      })

      if (codeExists) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: couponData,
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

// DELETE - Delete a coupon (admin only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if coupon is used in any orders
    const ordersWithCoupon = await prisma.order.findFirst({
      where: { couponId: params.id },
    })

    if (ordersWithCoupon) {
      // Instead of deleting, just mark as inactive
      await prisma.coupon.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: "Coupon has been used in orders and was marked as inactive instead of deleted",
      })
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
