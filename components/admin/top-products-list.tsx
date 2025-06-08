import Image from "next/image";
import Link from "next/link";

import { getTopProducts } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

interface ProductImage {
  image: Buffer | { buffer: Buffer };
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice: number | null;
  totalSold: number;
  images: ProductImage[];
}

export default async function TopProductsList() {
  const products = await getTopProducts();

  return (
    <div className="space-y-4">
      {products.map((product: Product) => (
        <div key={product.id} className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
            <Image
              src={
                product.images[0]?.image
                  ? `data:image/jpeg;base64,${Buffer.from(
                      product.images[0].image.buffer || product.images[0].image
                    ).toString("base64")}`
                  : "/placeholder.svg?height=48&width=48"
              }
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/products/${product.id}`}
              className="font-medium hover:underline truncate block"
            >
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {product.totalSold} sold
            </p>
          </div>
          <div className="font-medium">
            {formatPrice(product.discountedPrice || product.price)}
          </div>
        </div>
      ))}
    </div>
  );
}
