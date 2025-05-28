"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, Heart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Product, ColorOption } from "@/types"

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const hasColors = product.colorOptions && product.colorOptions.length > 0
  const selectedColor = hasColors ? product.colorOptions[selectedColorIndex] : null

  const hasDiscount = product.discountedPrice !== null
  const discount = hasDiscount 
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0

  // Function to safely convert binary image data to base64
  const getImageUrl = (colorOption: ColorOption | null): string => {
    if (!colorOption?.image?.image) return "/placeholder.jpg"
    try {
      const base64String = Buffer.from(colorOption.image.image).toString('base64')
      return `data:image/jpeg;base64,${base64String}`
    } catch (error) {
      console.error("Error converting image data:", error)
      return "/placeholder.jpg"
    }
  }

  // Always send color in the link if available
  const productLink = hasColors
    ? `/products/${product.slug}?color=${encodeURIComponent(selectedColor?.color || product.colorOptions[0]?.color || "")}`
    : `/products/${product.slug}`

  return (
    <div className={cn(
      "group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg",
      "border border-gray-200 hover:border-gray-300",
      className
    )}>
      {/* Link wraps only the image and product details */}
      <Link href={productLink} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Image
            src={getImageUrl(selectedColor)}
            alt={`${product.name}${selectedColor ? ` - ${selectedColor.color}` : ''}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-sm font-medium rounded-full">
              {discount}% OFF
            </div>
          )}
          {/* Stock Badge */}
          {selectedColor && selectedColor.variants.every(v => v.stock === 0) && (
            <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 text-sm font-medium rounded-full">
              Out of Stock
            </div>
          )}
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                variant="default"
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-md transition-transform hover:scale-105"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-2">Quick View</span>
              </Button>
              <Button
                variant="default"
                size="icon"
                className="bg-white text-black hover:bg-gray-100 shadow-md transition-transform hover:scale-105"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.name}
          </p>
          
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && product.discountedPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.discountedPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Color Options (outside the Link) */}
      {hasColors && (
        <div className="flex gap-1.5 pt-2 px-4 pb-2">
          {product.colorOptions.map((colorOpt, index) => (
            <button
              key={colorOpt.color}
              className={cn(
                "w-6 h-6 rounded-full transition-transform hover:scale-110",
                "border-2 border-white ring-1",
                selectedColorIndex === index ? "ring-primary" : "ring-gray-200",
                colorOpt.variants.every(v => v.stock === 0) && "opacity-50"
              )}
              style={{ backgroundColor: colorOpt.color.toLowerCase() }}
              title={`${colorOpt.color}${colorOpt.variants.every(v => v.stock === 0) ? ' (Out of Stock)' : ''}`}
              onClick={e => {
                e.preventDefault()
                setSelectedColorIndex(index)
              }}
              type="button"
            />
          ))}
        </div>
      )}

      {/* Available Sizes (outside the Link) */}
      {selectedColor && selectedColor.variants.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {selectedColor.variants.map((variant) => (
            <div
              key={variant.id}
              className={cn(
                "px-2 py-1 text-xs rounded border",
                variant.stock > 0
                  ? "border-gray-200 text-gray-600"
                  : "border-gray-100 text-gray-400 bg-gray-50"
              )}
              title={variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
            >
              {variant.size}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
