import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface OrderCardProps {
  order: {
    id: string
    status: string
    total: number
    createdAt: Date
    items: {
      id: string
      quantity: number
      product: {
        name: string
        images?: {
          id: string
          image: any
          color?: string | null
        }[]
      }
      variant?: {
        color: string
        size: string
      }
    }[]
    shippingAddress: {
      fullName: string
      city: string
      state: string
    }
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Get a summary of items (e.g., "Product A, Product B, and 3 more items")
  const getItemsSummary = () => {
    if (order.items.length === 0) return "No items"
    if (order.items.length === 1) return order.items[0].product.name
    
    const firstItem = order.items[0].product.name
    const remainingCount = order.items.length - 1
    return `${firstItem} and ${remainingCount} more item${remainingCount > 1 ? 's' : ''}`
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Order #{order.id.slice(-6)}</h3>
            <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Badge className={getStatusColor(order.status)} variant="outline">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Items:</p>
            <p className="text-sm text-muted-foreground">{getItemsSummary()}</p>
          </div>
          
          <div className="grid gap-1 mt-3">
            <p className="text-sm font-medium">Ship to:</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="font-semibold">{formatPrice(order.total)}</p>
            <Button variant="ghost" asChild className="flex items-center gap-1">
              <Link href={`/orders/${order.id}`}>
                View Details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 