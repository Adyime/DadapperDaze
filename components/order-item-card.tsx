import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

interface OrderItemCardProps {
  item: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      slug: string
      images: {
        id: string
        image: any
        color?: string | null
      }[]
    }
    variant: {
      id: string
      color: string
      size: string
    }
  }
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  const totalPrice = item.price * item.quantity
  
  // Get the image that matches the variant color or use the first available image
  const image = item.product.images && item.product.images.length > 0
    ? item.product.images.find(img => img.color === item.variant.color) || item.product.images[0]
    : null

  // Function to safely convert image data to base64
  const getImageSrc = (imageData: any) => {
    try {
      if (!imageData) return "/placeholder.svg?height=96&width=96";
      
      // If it's already a string (like a URL), return it
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:')) return imageData;
        return `data:image/jpeg;base64,${imageData}`;
      }
      
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
      return "/placeholder.svg?height=96&width=96";
    } catch (error) {
      console.error("Error processing image data:", error);
      return "/placeholder.svg?height=96&width=96";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4">
      <div className="relative h-24 w-24 overflow-hidden rounded-md bg-muted">
        <Link href={`/products/${item.product.slug}`}>
          {image ? (
            <Image
              src={getImageSrc(image.image)}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
              <span className="text-xs">No image</span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/products/${item.product.slug}`} className="font-medium">
          {item.product.name}
        </Link>
        <div className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium">{item.variant.color} - {item.variant.size}</span> • {formatPrice(item.price)} each
        </div>
        <div className="mt-2">
          <span className="text-sm">Quantity: {item.quantity}</span>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 text-right font-medium">{formatPrice(totalPrice)}</div>
    </div>
  )
} 