import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET - Get all coupons (admin only)
export async function GET(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const page = Number(searchParams.get("page") || "1")
    const limit = Number(searchParams.get("limit") || "10")
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

    return NextResponse.json({
      coupons,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

// POST - Create a new coupon (admin only)
export async function POST(request: Request) {
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
        isActive: z.boolean().default(true),
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

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: couponData.code },
    })

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: couponData,
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
