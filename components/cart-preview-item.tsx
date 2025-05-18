"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"

interface CartPreviewItemProps {
  item: {
    id: string
    quantity: number
    product: {
      id: string
      name: string
      slug: string
      price: number
      discountedPrice: number | null
      imageUrl: string | null
      images: {
        id: string
        image: any
        color?: string | null
      }[]
    }
    variant?: {
      color: string
      size: string
    }
  }
}

export default function CartPreviewItem({ item }: CartPreviewItemProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const price = item.product.discountedPrice || item.product.price
  const totalPrice = price * item.quantity

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quantity")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update quantity",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function removeItem() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to safely convert image data to base64
  const getImageSrc = (imageData: any) => {
    try {
      if (!imageData) return "/placeholder.svg?height=64&width=64";
      
      // If it's already a string (like a URL), return it
      if (typeof imageData === 'string') return imageData;
      
      // If it's a Buffer or can be converted to Buffer
      if (Buffer.isBuffer(imageData)) {
        return `data:image/jpeg;base64,${imageData.toString('base64')}`;
      }
      
      // If it's a Uint8Array or ArrayBuffer or other view
      if (imageData instanceof Uint8Array) {
        return `data:image/jpeg;base64,${Buffer.from(imageData).toString('base64')}`;
      }
      
      // If it has a data property (from database)
      if (imageData && typeof imageData === 'object' && 'data' in imageData) {
        return `data:image/jpeg;base64,${Buffer.from(imageData.data).toString('base64')}`;
      }
      
      // Return placeholder as fallback
      return "/placeholder.svg?height=64&width=64";
    } catch (error) {
      console.error("Error processing image data:", error);
      return "/placeholder.svg?height=64&width=64";
    }
  };

  // Get the image that matches the variant color or use the first available image
  const colorSpecificImage = item.variant && item.product.images.find(img => img.color === item.variant?.color) || item.product.images[0];

  return (
    <div className="flex gap-3">
      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
        <Link href={`/products/${item.product.slug}`}>
          <Image
            src={colorSpecificImage ? getImageSrc(colorSpecificImage.image) : "/placeholder.svg?height=64&width=64"}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/products/${item.product.slug}`} className="line-clamp-1 font-medium">
          {item.product.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              disabled={isLoading || item.quantity <= 1}
              onClick={() => updateQuantity(item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="w-4 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              disabled={isLoading}
              onClick={() => updateQuantity(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatPrice(totalPrice)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              disabled={isLoading}
              onClick={removeItem}
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
