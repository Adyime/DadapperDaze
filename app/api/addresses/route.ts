import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// Schema for validating address data
const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().default(false),
})

// GET - Get user's addresses
export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        isDefault: "desc",
      },
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

// POST - Create a new address
export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = addressSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { isDefault, ...addressData } = validationResult.data
    
    // If setting as default, unset any existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }
    
    // Create the new address
    const address = await prisma.address.create({
      data: {
        ...addressData,
        isDefault,
        userId: user.id,
      },
    })
    
    return NextResponse.json(address)
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
} 