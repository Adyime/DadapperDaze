"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
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
        image: any  // Changed from Buffer to any
        color?: string | null
      }[]
    }
    variant: {
      id: string
      color: string
      size: string
      stock: number
    }
  }
}

export default function CartItem({ item }: CartItemProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(item.quantity)
  const [isLoading, setIsLoading] = useState(false)

  const price = item.product.discountedPrice || item.product.price
  const totalPrice = price * quantity

  // Get the image that matches the variant color or use the first available image
  const colorSpecificImage = item.product.images.find(img => img.color === item.variant.color) || item.product.images[0]

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1) return

    setIsLoading(true)
    setQuantity(newQuantity)

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

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update quantity",
        variant: "destructive",
      })
      setQuantity(item.quantity) // Reset to original quantity on error
    } finally {
      setIsLoading(false)
    }
  }

  async function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuantity = Number.parseInt(e.target.value)
    if (isNaN(newQuantity) || newQuantity < 1) return
    updateQuantity(newQuantity)
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

      router.refresh()
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

  // Ensure we have a valid image source
  let imageSource = "/placeholder.svg?height=96&width=96"
  
  if (colorSpecificImage && colorSpecificImage.image) {
    // Handle different image data formats
    try {
      // Check if the image is already a base64 string
      if (typeof colorSpecificImage.image === 'string') {
        imageSource = `data:image/jpeg;base64,${colorSpecificImage.image}`
      } 
      // Check if it's a Buffer or Uint8Array
      else if (colorSpecificImage.image instanceof Uint8Array || Buffer.isBuffer(colorSpecificImage.image)) {
        imageSource = `data:image/jpeg;base64,${Buffer.from(colorSpecificImage.image).toString('base64')}`
      } 
      // If it's an object with data property (serialized buffer)
      else if (colorSpecificImage.image.data) {
        imageSource = `data:image/jpeg;base64,${Buffer.from(colorSpecificImage.image.data).toString('base64')}`
      }
    } catch (error) {
      console.error("Error processing image:", error)
      imageSource = "/placeholder.svg?height=96&width=96"
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4">
      <div className="relative h-24 w-24 overflow-hidden rounded-md bg-muted">
        <Link href={`/products/${item.product.slug}`}>
          <Image
            src={imageSource}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/products/${item.product.slug}`} className="font-medium">
          {item.product.name}
        </Link>
        <div className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium">{item.variant.color} - {item.variant.size}</span> • {formatPrice(price)} each
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isLoading || quantity <= 1}
              onClick={() => updateQuantity(quantity - 1)}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <Input
              type="number"
              min="1"
              className="h-8 w-14 text-center"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isLoading}
              onClick={() => updateQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            disabled={isLoading}
            onClick={removeItem}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 text-right font-medium">{formatPrice(totalPrice)}</div>
    </div>
  )
}
