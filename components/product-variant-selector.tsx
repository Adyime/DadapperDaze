"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ProductVariant {
  id: string
  color: string
  size: string
  stock: number
}

interface ProductVariantSelectorProps {
  productId: string
  variants: ProductVariant[]
  selectedColor?: string
  selectedSize?: string
}

export default function ProductVariantSelector({ 
  productId, 
  variants,
  selectedColor,
  selectedSize
}: ProductVariantSelectorProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  
  // Update quantity whenever variant changes
  useEffect(() => {
    setQuantity(1) // Reset quantity when selection changes
  }, [selectedColor, selectedSize])

  // Find the selected variant
  const selectedVariant = selectedColor && selectedSize
    ? variants.find(v => v.color === selectedColor && v.size === selectedSize && v.stock > 0)
    : null

  // Check if we have a valid selection
  const hasValidSelection = !!selectedVariant

  // Handle adding to cart
  async function handleAddToCart() {
    if (!session) {
      router.push("/login?callbackUrl=/cart")
      return
    }

    if (!hasValidSelection) {
      toast({
        title: "Please select options",
        description: selectedColor 
          ? "Please select a size" 
          : "Please select color and size",
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
          productId,
          variantId: selectedVariant.id,
          quantity,
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

  // Calculate stock status message
  let stockStatus = "Out of stock"
  if (selectedVariant) {
    if (selectedVariant.stock > 10) {
      stockStatus = "In stock"
    } else if (selectedVariant.stock > 0) {
      stockStatus = `Only ${selectedVariant.stock} left in stock`
    }
  } else if (selectedColor) {
    // If color is selected but size isn't, check if any sizes are available
    const anyAvailable = variants.some(v => v.color === selectedColor && v.stock > 0)
    stockStatus = anyAvailable ? "Please select a size" : "Out of stock in this color"
  } else {
    stockStatus = "Please select options"
  }

  // Calculate maximum available quantity for the selected variant
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 10) : 0

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Quantity:</span>
        <div className="flex border rounded-md">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-lg border-r"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={!hasValidSelection}
          >
            -
          </button>
          <span className="w-12 h-10 flex items-center justify-center">{quantity}</span>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-lg border-l"
            onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
            disabled={!hasValidSelection}
          >
            +
          </button>
        </div>
      </div>

      {/* Stock status */}
      <div className="text-sm">
        <span className={selectedVariant?.stock ? 'text-green-600' : 'text-red-600'}>
          {stockStatus}
        </span>
      </div>

      {/* Add to cart button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || !hasValidSelection}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  )
} 