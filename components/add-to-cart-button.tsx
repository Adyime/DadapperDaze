"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface AddToCartButtonProps {
  productId: string
  variants: {
    id: string
    color: string
    size: string
    stock: number
  }[]
  quantity?: number
  className?: string
}

export default function AddToCartButton({ 
  productId, 
  variants = [], // Default to empty array if variants is undefined
  quantity = 1, 
  className 
}: AddToCartButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")

  // Ensure variants is always an array
  const productVariants = Array.isArray(variants) ? variants : []

  async function handleAddToCart() {
    if (!session) {
      router.push("/login?callbackUrl=/cart")
      return
    }

    if (!selectedVariantId) {
      toast({
        title: "Error",
        description: "Please select a variant",
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
          variantId: selectedVariantId,
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

  // If no variants are available, show a disabled button
  if (productVariants.length === 0) {
    return (
      <Button disabled className={className}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
        <SelectTrigger>
          <SelectValue placeholder="Select a variant" />
        </SelectTrigger>
        <SelectContent>
          {productVariants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id} disabled={variant.stock === 0}>
              {variant.color} - {variant.size} {variant.stock === 0 ? "(Out of stock)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleAddToCart} disabled={isLoading || !selectedVariantId} className={className}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
    </div>
  )
}
