import { cache } from "react"

import { prisma } from "@/lib/db"
import { clearCart } from "@/lib/cart"

// Get user orders
export const getUserOrders = cache(async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                select: {
                  id: true,
                  image: true,
                  color: true
                }
              }
            },
          },
          variant: true
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

  return orders
})

// Get order by ID
export const getOrderById = cache(async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                select: {
                  id: true,
                  image: true,
                  color: true
                }
              }
            },
          },
          variant: true
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

  return order
})

// Create order
export async function createOrder({
  userId,
  items,
  subtotal,
  discount,
  shippingCost,
  total,
  couponId,
  paymentMethod,
  paymentIntentId,
  shippingAddress,
}: {
  userId: string
  items: {
    productId: string
    variantId: string
    name: string
    price: number
    quantity: number
  }[]
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  couponId?: string
  paymentMethod: string
  paymentIntentId?: string
  shippingAddress: any
}) {
  const order = await prisma.order.create({
    data: {
      userId,
      subtotal,
      discount,
      shippingCost,
      total,
      couponId,
      paymentMethod,
      paymentIntentId,
      shippingAddress,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  // Update coupon usage if used
  if (couponId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    })
  }

  // Clear the cart
  await clearCart(userId)

  return order
}

// Update order status
export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.update({
    where: { id },
    data: { status: status as any },
  })

  return order
}
