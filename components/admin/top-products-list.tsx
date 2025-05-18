import Image from "next/image"
import Link from "next/link"

import { getTopProducts } from "@/lib/admin"
import { formatPrice } from "@/lib/utils"

export default async function TopProductsList() {
  const products = await getTopProducts()

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
            <Image
              src={product.images[0] ? `data:image/jpeg;base64,${Buffer.from(product.images[0].image).toString('base64')}` : "/placeholder.svg?height=48&width=48"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline truncate block">
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{product.totalSold} sold</p>
          </div>
          <div className="font-medium">{formatPrice(product.discountedPrice || product.price)}</div>
        </div>
      ))}
    </div>
  )
}
