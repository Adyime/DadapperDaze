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

// GET - Get a specific address
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const address = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 })
  }
}

// PUT - Update an address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

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
    if (isDefault && !existingAddress.isDefault) {
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
    
    // Update the address
    const updatedAddress = await prisma.address.update({
      where: {
        id: params.id,
      },
      data: {
        ...addressData,
        isDefault,
      },
    })
    
    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

// DELETE - Delete an address
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if address exists and belongs to user
    const address = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Delete the address
    await prisma.address.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
} 