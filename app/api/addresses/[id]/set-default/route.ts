import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// POST - Set an address as default
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

    // Reset all addresses to non-default
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })

    // Set the selected address as default
    await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    })

    // Redirect back to the addresses page
    return NextResponse.redirect(new URL("/profile/addresses", request.url), { status: 303 })
  } catch (error) {
    console.error("Error setting default address:", error)
    return NextResponse.redirect(new URL("/profile/addresses?error=failed-to-set-default", request.url))
  }
} 