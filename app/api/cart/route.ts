import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { getUserCart, addToCart, clearCart } from "@/lib/cart"

// GET - Get user cart
export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cart = await getUserCart(user.id)
    return NextResponse.json(cart)
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      productId: z.string().min(1, "Product ID is required"),
      variantId: z.string().min(1, "Variant ID is required"),
      quantity: z.number().int().positive("Quantity must be a positive integer"),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { productId, variantId, quantity } = validationResult.data

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { id: variantId },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!product.variants[0]) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    if (product.variants[0].stock < quantity) {
      return NextResponse.json({ error: "Not enough stock available" }, { status: 400 })
    }

    const updatedCart = await addToCart(user.id, productId, variantId, quantity)
    return NextResponse.json(updatedCart)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}

// DELETE - Clear cart
export async function DELETE() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await clearCart(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
