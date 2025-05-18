import Link from "next/link"
import Image from "next/image"

import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AddToCartButton from "@/components/add-to-cart-button"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    discountedPrice: number | null
    displayColor?: string
    displayImage?: {
      id: string
      image: Buffer | any
      color?: string | null
    } | null
    category: {
      name: string
      slug: string
    }
    images: {
      id: string
      image: Buffer | any
      color?: string | null
    }[]
    variants: {
      id: string
      color: string
      size: string
      stock: number
    }[]
    variantSlug?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0

  // Use the variant-specific image if available, otherwise fallback to the first image
  const displayImage = product.displayImage || product.images[0] || null;
  
  // Use the variant-specific slug if available for navigation
  const productUrl = product.variantSlug || `/products/${product.slug}`;

  // Create a safe image URL from the image data
  const getImageUrl = () => {
    if (!displayImage) return "/placeholder.svg?height=400&width=400";
    
    try {
      if (displayImage.image && typeof displayImage.image === 'object') {
        // If image is a Buffer-like object with data property (common with some ORMs)
        if ('data' in displayImage.image) {
          return `data:image/jpeg;base64,${Buffer.from(displayImage.image.data).toString('base64')}`;
        }
        // If image is already a Buffer
        if (Buffer.isBuffer(displayImage.image)) {
          return `data:image/jpeg;base64,${displayImage.image.toString('base64')}`;
        }
      }
      // For API routes that return base64 directly
      if (typeof displayImage.image === 'string' && displayImage.image.startsWith('data:')) {
        return displayImage.image;
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
    
    return "/placeholder.svg?height=400&width=400";
  };
  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      <Link href={productUrl} className="aspect-square overflow-hidden bg-muted">
        <Image
          src={getImageUrl()}
          alt={product.name}
          width={400}
          height={400}
          className="object-cover transition-transform group-hover:scale-105 h-full w-full"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">{discount}% OFF</Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium">
          <Link href={productUrl}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
          {product.displayColor && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm font-medium">{product.displayColor}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {product.discountedPrice ? (
            <>
              <span className="font-medium">{formatPrice(product.discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-medium">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="mt-4">
          <AddToCartButton 
            productId={product.id} 
            variants={product.variants} 
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
