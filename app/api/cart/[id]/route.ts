import { NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentUser } from "@/lib/session"
import { updateCartItem, removeCartItem } from "@/lib/cart"

// PUT - Update cart item quantity
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { quantity } = validationResult.data

    const updatedCart = await updateCartItem(user.id, params.id, quantity)
    return NextResponse.json(updatedCart)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const updatedCart = await removeCartItem(user.id, params.id)
    return NextResponse.json(updatedCart)
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}
