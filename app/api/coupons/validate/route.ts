import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      code: z.string().min(1, "Coupon code is required"),
      subtotal: z.number().positive("Subtotal must be positive"),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { code, subtotal } = validationResult.data

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ error: "Coupon is not active" }, { status: 400 })
    }

    // Check if coupon is expired
    const now = new Date()
    if (coupon.startDate > now || coupon.endDate < now) {
      return NextResponse.json({ error: "Coupon is expired or not yet valid" }, { status: 400 })
    }

    // Check if usage limit is reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    // Check minimum order value
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value for this coupon is ${coupon.minOrderValue}`,
        },
        { status: 400 },
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      discount = coupon.discountValue
      if (discount > subtotal) {
        discount = subtotal
      }
    }

    return NextResponse.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
