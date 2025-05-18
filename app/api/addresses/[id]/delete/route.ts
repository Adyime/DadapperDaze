import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// POST - Delete an address
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const addressId = params.id
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Check if address exists and belongs to user
    const address = await prisma.address.findUnique({
      where: {
        id: addressId,
        userId: user.id,
      },
    })

    if (!address) {
      throw new Error("Address not found")
    }

    // Delete the address
    await prisma.address.delete({
      where: {
        id: addressId,
      },
    })

    // Redirect back to the addresses page
    return NextResponse.redirect(new URL("/profile/addresses", request.url), { status: 303 })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.redirect(new URL("/profile/addresses?error=failed-to-delete", request.url))
  }
} 