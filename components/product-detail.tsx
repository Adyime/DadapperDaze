"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { formatPrice } from "@/lib/utils"
import ProductVariantSelector from "@/components/product-variant-selector"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext,
  type CarouselApi
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

interface ProductVariant {
  id: string
  color: string
  size: string
  stock: number
}

interface ProductImage {
  id: string
  image: any
  imageUrl: string
  color?: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountedPrice: number | null
  categoryId: string
  category: {
    name: string
    slug: string
  }
  images: ProductImage[]
  variants: ProductVariant[]
}

interface ProductDetailProps {
  product: Product
  initialColor?: string
  initialSize?: string
  slug: string
}

export default function ProductDetail({ 
  product, 
  initialColor,
  initialSize,
  slug
}: ProductDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for selected color and size
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [colorImages, setColorImages] = useState<ProductImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  
  // Debug: Log product data
  useEffect(() => {
    console.log('Product:', {
      id: product.id,
      name: product.name,
      slug: product.slug,
      initialColor,
      colors: [...new Set(product.variants.map(v => v.color))],
      imageCount: product.images.length
    });
  }, [product, initialColor]);
  
  // Fetch images for the selected color
  const fetchColorImages = useCallback(async (color: string) => {
    if (!color) return

    setIsLoadingImages(true)
    try {
      console.log(`Fetching images for product ${product.id}, color ${color}`)
      const response = await fetch(`/api/products/images?productId=${product.id}&color=${color}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch color images')
      }
      
      const data = await response.json()
      console.log('Fetched color images:', data)
      
      if (data.images && data.images.length > 0) {
        setColorImages(data.images)
      } else {
        // Fallback to the first image of the product if no color-specific images
        setColorImages(product.images.length > 0 ? [product.images[0]] : [])
      }
    } catch (error) {
      console.error('Error fetching color images:', error)
      // Fallback to product images
      setColorImages(product.images.filter(img => img.color === color || !img.color))
    } finally {
      setIsLoadingImages(false)
    }
  }, [product.id, product.images])
  
  // Update URL when selections change, without full page reload
  useEffect(() => {
    if (!selectedColor) return
    
    const params = new URLSearchParams(searchParams.toString())
    
    // Update the color parameter
    params.set('color', selectedColor)
    
    // Update or remove the size parameter
    if (selectedSize) {
      params.set('size', selectedSize)
    } else {
      params.delete('size')
    }
    
    // Update URL without reloading the page
    const url = `/products/${slug}?${params.toString()}`
    router.replace(url, { scroll: false })
  }, [selectedColor, selectedSize, router, slug, searchParams])
  
  // Fetch images when color changes
  useEffect(() => {
    if (selectedColor) {
      fetchColorImages(selectedColor)
    } else if (product.images.length > 0) {
      setColorImages([product.images[0]])
    }
  }, [selectedColor, fetchColorImages, product.images])
  
  // Get all available colors
  const availableColors = [...new Set(product.variants.map(v => v.color))]
  
  // Get all available sizes for the selected color
  const availableSizes = selectedColor 
    ? [...new Set(product.variants
        .filter(v => v.color === selectedColor)
        .map(v => v.size))]
    : []
  
  // Create a map of color to their images
  const colorImagesMap = availableColors.map(color => {
    // Get all images for this color
    const images = product.images.filter(img => img.color === color)
    // Get the first image or use the first product image as fallback
    const mainImage = images.length > 0 ? images[0] : product.images[0] || null
    
    return {
      color,
      image: mainImage
    }
  })
  
  // Reset image index when color changes
  useEffect(() => {
    setSelectedImageIndex(0)
    carouselApi?.scrollTo(0)
  }, [selectedColor, carouselApi])
  
  // Check if a variant with the selected attributes exists and is in stock
  const getVariantAvailability = (color: string, size: string) => {
    const variant = product.variants.find(v => 
      v.color === color && 
      v.size === size
    )
    
    return variant ? variant.stock > 0 : false
  }
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    
    // If current size isn't available in the new color, reset size
    if (selectedSize && !getVariantAvailability(color, selectedSize)) {
      setSelectedSize(undefined)
    }
  }
  
  // Handle size selection
  const handleSizeSelect = (size: string) => {
    if (selectedColor && getVariantAvailability(selectedColor, size)) {
      setSelectedSize(size)
    }
  }

  // Handle thumbnail click - directly control the carousel
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index)
    carouselApi?.scrollTo(index)
  }
  
  // Sync carousel with selected image index
  useEffect(() => {
    if (!carouselApi) return
    
    const onSelect = () => {
      setSelectedImageIndex(carouselApi.selectedScrollSnap())
    }
    
    carouselApi.on("select", onSelect)
    
    // Cleanup
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 md:gap-y-0">
      {/* Left: Images */}
      <div className="flex flex-col gap-6 md:pr-8">
        {/* Main image carousel */}
        <Carousel 
          className="w-full relative rounded-2xl shadow-lg bg-drb-light"
          setApi={setCarouselApi}
          opts={{
            startIndex: selectedImageIndex,
            loop: true
          }}
        >
          <CarouselContent>
            {isLoadingImages ? (
              <CarouselItem>
                <div className="relative aspect-square rounded-2xl bg-drb-light flex items-center justify-center">
                  <span className="text-drb-gray font-sans">Loading images...</span>
                </div>
              </CarouselItem>
            ) : colorImages.length > 0 ? (
              colorImages.map((image, index) => (
                <CarouselItem key={image.id || index}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-drb-light">
                    <Image
                      src={image.imageUrl || "/placeholder.svg?height=600&width=600"}
                      alt={`${product.name} - ${selectedColor || 'product'} - view ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      onError={(e) => {
                        // @ts-ignore
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = "/placeholder.svg?height=600&width=600";
                      }}
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="relative aspect-square rounded-2xl bg-drb-light flex items-center justify-center">
                  <span className="text-drb-gray font-sans">No image available</span>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {colorImages.length > 1 && !isLoadingImages && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-drb-dark hover:bg-drb-pink hover:text-white shadow rounded-full" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-drb-dark hover:bg-drb-pink hover:text-white shadow rounded-full" />
            </>
          )}
        </Carousel>
        {/* Thumbnails */}
        {colorImages.length > 1 && !isLoadingImages && (
          <div className="flex space-x-3 overflow-x-auto py-2">
            {colorImages.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative h-16 w-16 border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all
                  ${index === selectedImageIndex ? 'border-drb-pink ring-2 ring-drb-pink' : 'border-drb-light hover:border-drb-pink'}
                `}
                aria-label={`View image ${index + 1}`}
                tabIndex={0}
              >
                <Image
                  src={image.imageUrl || "/placeholder.svg?height=600&width=600"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // @ts-ignore
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/placeholder.svg?height=600&width=600";
                  }}
                />
              </button>
            ))}
          </div>
        )}
        {/* Color variant thumbnails */}
        <div className="flex flex-wrap gap-3 mt-2">
          <span className="block w-full text-sm font-sans text-drb-dark mb-1">Choose color:</span>
          {colorImagesMap.map((item, index) => {
            const isSelected = item.color === selectedColor
            return (
              <button 
                key={index}
                type="button"
                onClick={() => handleColorSelect(item.color)}
                className={`relative h-12 w-12 border-2 rounded-full overflow-hidden transition-all flex items-center justify-center
                  ${isSelected ? 'border-drb-pink ring-2 ring-drb-pink' : 'border-drb-light hover:border-drb-pink'}
                  focus:outline-none focus:ring-2 focus:ring-drb-pink
                `}
                title={item.color}
                aria-label={`Select color ${item.color}`}
                tabIndex={0}
              >
                {item.image ? (
                  <Image
                    src={item.image.imageUrl || "/placeholder.svg?height=600&width=600"}
                    alt={`${product.name} - ${item.color}`}
                    fill
                    className="object-cover rounded-full"
                    onError={(e) => {
                      // @ts-ignore
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/placeholder.svg?height=600&width=600";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-drb-light flex items-center justify-center rounded-full">
                    <span className="text-xs text-drb-gray font-sans">{item.color}</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-white/80 text-center text-xs py-0.5 font-sans rounded-b-full">
                  {item.color}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {/* Right: Product info */}
      <div className="flex flex-col gap-8 md:pl-8">
        <div className="flex flex-col gap-2 border-b border-drb-light pb-4">
          <h1 className="font-heading text-4xl font-extrabold text-drb-dark mb-0 leading-tight">{product.name}</h1>
          <p className="text-drb-pink font-heading text-lg font-semibold">{product.category.name}</p>
        </div>
        <div className="flex items-baseline gap-4">
          {product.discountedPrice && product.discountedPrice < product.price ? (
            <>
              <span className="text-3xl font-extrabold text-drb-pink font-heading">{formatPrice(product.discountedPrice)}</span>
              <span className="text-drb-gray line-through font-sans">{formatPrice(product.price)}</span>
              <span className="text-base font-semibold text-green-600 font-sans">
                {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off
              </span>
            </>
          ) : (
            <span className="text-3xl font-extrabold text-drb-pink font-heading">{formatPrice(product.price)}</span>
          )}
        </div>
        {/* Color display */}
        {selectedColor && (
          <div className="mb-2">
            <p className="font-sans font-medium text-drb-dark">Color: <span className="text-drb-pink font-semibold">{selectedColor}</span></p>
          </div>
        )}
        {/* Size selection */}
        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <span className="block text-sm font-sans text-drb-dark mb-1">Choose size:</span>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size: string) => {
                const isSelected = size === selectedSize
                const isAvailable = getVariantAvailability(selectedColor!, size)
                return (
                  <button 
                    key={size}
                    type="button"
                    onClick={() => handleSizeSelect(size)}
                    disabled={!isAvailable}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 font-heading text-lg font-bold transition-colors
                      ${isSelected ? 'bg-drb-pink text-white border-drb-pink' : 'bg-white text-drb-dark border-drb-light'}
                      ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:bg-drb-light hover:border-drb-pink'}
                      focus:outline-none focus:ring-2 focus:ring-drb-pink
                    `}
                    aria-label={`Select size ${size}`}
                    tabIndex={0}
                  >
                    <span>{size}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <p className="text-drb-gray font-sans text-base leading-relaxed mt-2 mb-4">{product.description}</p>
        <div className="pt-2">
          <ProductVariantSelector
            productId={product.id}
            variants={product.variants}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
        </div>
      </div>
    </div>
  )
} 