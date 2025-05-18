import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { getUserCart } from "@/lib/cart"
import { createOrder } from "@/lib/orders"

// GET - Get user orders
export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
        coupon: {
          select: {
            code: true,
            discountValue: true,
            discountType: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST - Create a new order
export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const addressSchema = z.object({
      fullName: z.string().min(1, "Full name is required"),
      streetAddress: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    })

    const schema = z.object({
      paymentMethod: z.string().min(1, "Payment method is required"),
      shippingAddress: addressSchema,
      couponCode: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { paymentMethod, shippingAddress, couponCode } = validationResult.data

    // Get user's cart
    const cart = await getUserCart(user.id)

    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate order totals
    const subtotal = cart.subtotal
    let discount = 0
    let couponId = undefined

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 })
      }

      if (!coupon.isActive || coupon.endDate < new Date() || coupon.startDate > new Date()) {
        return NextResponse.json({ error: "Coupon is not active" }, { status: 400 })
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
      }

      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          {
            error: `Minimum order value for this coupon is ${coupon.minOrderValue}`,
          },
          { status: 400 },
        )
      }

      // Calculate discount
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

      couponId = coupon.id
    }

    const shippingCost = 0 // Free shipping for now
    const total = subtotal - discount + shippingCost

    // Create order items
    const orderItems = cart.items.map((item) => ({
      productId: item.product.id,
      variantId: item.variant.id,
      price: item.product.discountedPrice || item.product.price,
      quantity: item.quantity,
    }))

    // Create the order
    const order = await createOrder({
      userId: user.id,
      items: orderItems,
      subtotal,
      discount,
      shippingCost,
      total,
      couponId,
      paymentMethod,
      paymentIntentId: undefined,
      shippingAddress,
    })

    // For Razorpay payment, create a payment intent
    if (paymentMethod === "RAZORPAY") {
      try {
        // Create a Razorpay order
        const razorpay = new (require("razorpay"))({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
        });

        const options = {
          amount: Math.round(total * 100), // Convert to smallest currency unit (paise)
          currency: "INR",
          receipt: `receipt_order_${order.id}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Update the order with the payment intent ID
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentIntentId: razorpayOrder.id },
        });

        // Add payment intent ID to response
        order.paymentIntentId = razorpayOrder.id;
      } catch (error) {
        console.error("Error creating Razorpay order:", error);
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
