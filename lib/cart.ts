import { prisma, getCache, setCache, deleteCache } from "@/lib/db"
import { Prisma } from "@prisma/client"

// Helper functions
function calculateSubtotal(items: any[]) {
  return items.reduce((total, item) => {
    const price = item.product.discountedPrice || item.product.price
    return total + price * item.quantity
  }, 0)
}

function calculateTotal(items: any[]) {
  const subtotal = calculateSubtotal(items)
  // Add shipping, tax, etc. here
  return subtotal
}

// Get user cart
export async function getUserCart(userId: string) {
  const cacheKey = `cart:${userId}`

  const cachedCart = await getCache(cacheKey)
  if (cachedCart) {
    return cachedCart
  }

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountedPrice: true,
              images: {
                orderBy: [
                  { color: 'asc' },
                  { order: 'asc' }
                ],
                select: {
                  id: true,
                  image: true,
                  color: true,
            },
          },
            },
          },
          variant: true,
        },
      },
    },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
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
                price: true,
                discountedPrice: true,
                images: {
                  orderBy: [
                    { color: 'asc' },
                    { order: 'asc' }
                  ],
                  select: {
                    id: true,
                    image: true,
                    color: true,
              },
            },
              },
            },
            variant: true,
          },
        },
      },
    })
  }

  const cartWithTotals = {
    ...cart,
    subtotal: calculateSubtotal(cart.items),
    total: calculateTotal(cart.items),
  }

  await setCache(cacheKey, cartWithTotals, 60 * 5) // Cache for 5 minutes

  return cartWithTotals
}

// Add item to cart
export async function addToCart(userId: string, productId: string, variantId: string, quantity: number) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  })

  if (!cart) {
    const newCart = await prisma.cart.create({
      data: {
        userId,
        items: {
          create: {
            productId,
            variantId,
            quantity,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountedPrice: true,
                images: {
                  orderBy: [
                    { color: 'asc' },
                    { order: 'asc' }
                  ],
                  select: {
                    id: true,
                    image: true,
                    color: true,
              },
            },
              },
            },
            variant: true,
          },
        },
      },
    })

    await deleteCache(`cart:${userId}`)

    return {
      ...newCart,
      subtotal: calculateSubtotal(newCart.items),
      total: calculateTotal(newCart.items),
    }
  }

  const existingItem = cart.items.find(
    (item) => item.productId === productId && item.variantId === variantId
  )

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      },
    })
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountedPrice: true,
              images: {
                orderBy: [
                  { color: 'asc' },
                  { order: 'asc' }
                ],
                select: {
                  id: true,
                  image: true,
                  color: true,
            },
          },
            },
          },
          variant: true,
        },
      },
    },
  })

  await deleteCache(`cart:${userId}`)

  return {
    ...updatedCart!,
    subtotal: calculateSubtotal(updatedCart!.items),
    total: calculateTotal(updatedCart!.items),
  }
}

// Update cart item quantity
export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(userId, itemId)
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  })

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountedPrice: true,
              images: {
                orderBy: [
                  { color: 'asc' },
                  { order: 'asc' }
                ],
                select: {
                  id: true,
                  image: true,
                  color: true,
            },
          },
            },
          },
          variant: true,
        },
      },
    },
  })

  await deleteCache(`cart:${userId}`)

  return {
    ...updatedCart!,
    subtotal: calculateSubtotal(updatedCart!.items),
    total: calculateTotal(updatedCart!.items),
  }
}

// Remove item from cart
export async function removeCartItem(userId: string, itemId: string) {
  await prisma.cartItem.delete({
    where: { id: itemId },
  })

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountedPrice: true,
              images: {
                orderBy: [
                  { color: 'asc' },
                  { order: 'asc' }
                ],
                select: {
                  id: true,
                  image: true,
                  color: true,
            },
          },
            },
          },
          variant: true,
        },
      },
    },
  })

  await deleteCache(`cart:${userId}`)

  return {
    ...updatedCart!,
    subtotal: calculateSubtotal(updatedCart!.items),
    total: calculateTotal(updatedCart!.items),
  }
}

// Clear cart
export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId,
      },
    },
  })

  await deleteCache(`cart:${userId}`)

  return {
    id: "",
    userId,
    items: [],
    subtotal: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
