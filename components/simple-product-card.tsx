"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    discountedPrice: number | null
    category: {
      name: string
      slug: string
    }
    images: {
      id: string
      image: string | null // Now a data URL string (data:image/jpeg;base64,...) or null
      color?: string | null
    }[]
    variants: {
      id: string
      color: string
      size: string
      stock: number
    }[]
  }
}

// Client Component
export default function SimpleProductCard({ product }: SimpleProductCardProps) {
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0

  const [imageError, setImageError] = useState(false);

  // Get unique colors from variants
  const uniqueColors = [...new Set(product.variants.map(variant => variant.color))];

  // Create a map of color to image and variant information
  const colorImagesMap = uniqueColors.map(color => {
    // Find the first image for this color
    const colorImages = product.images.filter(img => img.color === color);
    const firstImage = colorImages.length > 0 ? colorImages[0] : product.images[0] || null;
    
    // Find a variant for this color (for the Add to Cart functionality)
    const variant = product.variants.find(v => v.color === color && v.stock > 0) || null;
    
    return {
      color,
      image: firstImage,
      variantId: variant?.id,
      inStock: !!variant,
    };
  });

  // State for currently selected color
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  
  // Get the currently selected color data
  const selectedColor = colorImagesMap[selectedColorIndex] || colorImagesMap[0];

  // Get image URL with fallback
  const hasImage = Boolean(selectedColor?.image?.image) && !imageError;
  const imageUrl = selectedColor?.image?.image || "/placeholder.svg?height=400&width=400";
  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      <Link href={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-muted relative">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={`${product.name} - ${selectedColor?.color || 'Product'}`}
            width={400}
            height={400}
            className="object-cover transition-transform group-hover:scale-105 h-full w-full"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground text-center p-4">
            <span>No image available</span>
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">{discount}% OFF</Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
          {selectedColor && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm font-medium">{selectedColor.color}</span>
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
        
        {/* Display color options */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Colors:</span>
          <div className="flex gap-1">
            {colorImagesMap.map((item, index) => (
              <div 
                key={index}
                className={`w-6 h-6 rounded-full border-2 ${
                  item.inStock ? 'cursor-pointer hover:scale-110 transition-transform' : 'opacity-50 cursor-not-allowed'
                } ${selectedColorIndex === index ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                style={{ 
                  backgroundColor: item.color.toLowerCase(),
                  borderColor: item.inStock ? '#000' : 'transparent'
                }}
                title={`${item.color}${!item.inStock ? ' (Out of stock)' : ''}`}
                onClick={(e) => {
                  if (item.inStock) {
                    e.preventDefault();
                    setSelectedColorIndex(index);
                    setImageError(false); // Reset image error when changing color
                  }
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <SimpleAddToCartButton 
            product={product}
            selectedVariantId={selectedColor?.variantId}
            hasStock={!!selectedColor?.inStock}
          />
        </div>
      </div>
    </div>
  )
}

// Client Component for Add to Cart Button
function SimpleAddToCartButton({ 
  product, 
  selectedVariantId,
  hasStock
}: { 
  product: SimpleProductCardProps['product'],
  selectedVariantId: string | undefined,
  hasStock: boolean
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleAddToCart() {
    if (!session) {
      router.push("/login?callbackUrl=/cart")
      return
    }

    if (!hasStock || !selectedVariantId) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={isLoading || !hasStock} 
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {hasStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  )
} 