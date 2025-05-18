import { Prisma } from "@prisma/client"
import Link from "next/link"
import { format } from "date-fns"
import { ShoppingCart } from "lucide-react"

import { prisma } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    items: {
      include: {
        product: true
        variant: true
      }
    }
  }
}>

function calculateTotalCartAmount(cart: CartWithItems): number {
  return cart.items.reduce((total, item) => {
    const price = item.product.discountedPrice || item.product.price
    return total + (price * item.quantity)
  }, 0)
}

export default async function AdminCartsPage() {
  // Get all carts with their items
  const carts = await prisma.cart.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const nonEmptyCarts = carts.filter(cart => cart.items.length > 0)

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customer Carts</h1>
      </div>

      {nonEmptyCarts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Active Carts</h2>
          <p className="text-muted-foreground">There are no carts with items at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {nonEmptyCarts.map((cart) => {
            const totalAmount = calculateTotalCartAmount(cart)
            return (
              <Card key={cart.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      Cart by {cart.user.name || cart.user.email}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {format(new Date(cart.updatedAt), "PPp")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Items ({cart.items.length})</h3>
                      <div className="space-y-2">
                        {cart.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.quantity}x</span> {item.product.name} -{" "}
                              <span className="text-muted-foreground">
                                {item.variant.color} / {item.variant.size}
                              </span>
                            </div>
                            <div>
                              {formatPrice((item.product.discountedPrice || item.product.price) * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between pt-4 border-t font-medium">
                      <span>Total Amount</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/users/${cart.user.id}`}>
                          View Customer
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 