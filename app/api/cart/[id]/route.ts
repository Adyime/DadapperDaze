import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { updateCartItem, removeCartItem } from "@/lib/cart";

type RouteParams = {
  params: { id: string };
};

// PUT - Update cart item quantity
export async function PUT(request: NextRequest, context: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    // Validate the input
    const schema = z.object({
      quantity: z
        .number()
        .int()
        .min(0, "Quantity must be a non-negative integer"),
    });

    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { quantity } = validationResult.data;
    const { id } = await Promise.resolve(context.params);

    const updatedCart = await updateCartItem(user.id, id, quantity);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest, context: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    const updatedCart = await removeCartItem(user.id, id);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
