import { Suspense } from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getProductBySlug, getRelatedProducts } from "@/lib/products"
import { formatPrice } from "@/lib/utils"
import ProductCard from "@/components/product-card"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import ProductDetail from "@/components/product-detail"

interface ProductVariant {
  id: string
  color: string
  size: string
  stock: number
}

interface ProductImage {
  id: string
  image: Buffer | any
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

type ProductPageProps = {
  params: {
    slug: string
  },
  searchParams: {
    color?: string
    size?: string
  }
}

// Helper function to create a safe image URL
function getImageUrl(imageData: any) {
  if (!imageData) return "/placeholder.svg?height=600&width=600";
  
  try {
    if (imageData && typeof imageData === 'object') {
      // If image is a Buffer-like object with data property (common with some ORMs)
      if ('data' in imageData) {
        return `data:image/jpeg;base64,${Buffer.from(imageData.data).toString('base64')}`;
      }
      // If image is already a Buffer
      if (Buffer.isBuffer(imageData)) {
        return `data:image/jpeg;base64,${imageData.toString('base64')}`;
      }
    }
    // For API routes that return base64 directly
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      return imageData;
    }
  } catch (error) {
    console.error("Error processing image:", error);
  }
  
  return "/placeholder.svg?height=600&width=600";
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    }
  }

  const imageUrl = product.images[0] ? getImageUrl(product.images[0].image) : "/placeholder.svg";

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [{ url: imageUrl }],
    },
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const product = await getProductBySlug(params.slug) as Product | null;

  if (!product) {
    notFound()
  }
  
  console.log("Server: Product retrieved", {
    slug: params.slug,
    name: product.name,
    imageCount: product.images.length,
    variants: product.variants.length
  });
  
  // Group images by color for debugging
  const imagesByColor = product.images.reduce<Record<string, any[]>>((acc, img) => {
    const color = img.color || 'default';
    acc[color] = acc[color] || [];
    acc[color].push({
      id: img.id,
      hasImage: !!img.image,
      color: img.color
    });
    return acc;
  }, {});
  
  console.log("Server: Images grouped by color", imagesByColor);
  
  // Process product images for client rendering
  const processedImages = product.images.map(img => {
    const imageUrl = getImageUrl(img.image);
    console.log(`Server: Processing image ${img.id}, color: ${img.color}, has URL: ${imageUrl !== "/placeholder.svg?height=600&width=600"}`);
    
    return {
      ...img,
      imageUrl
    };
  });

  // Create processed product object for client component
  const processedProduct = {
    ...product,
    images: processedImages
  };
  
  // Initial selected values from URL
  const initialColor = searchParams.color || 
    (product.variants.length > 0 ? product.variants[0].color : undefined);
  const initialSize = searchParams.size;
  
  console.log("Server: Rendering with", {
    initialColor,
    initialSize,
    availableColors: [...new Set(product.variants.map(v => v.color))],
  });

  return (
    <div className="container mx-auto py-8">
      <ProductDetail 
        product={processedProduct}
        initialColor={initialColor}
        initialSize={initialSize}
        slug={params.slug}
      />

      <div className="space-y-6 mt-16">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Suspense
            fallback={Array(4)
              .fill(null)
              .map((_, i) => <ProductCardSkeleton key={i} />)}
          >
            <RelatedProducts productId={product.id} categoryId={product.categoryId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function RelatedProducts({ productId, categoryId }: { productId: string; categoryId: string }) {
  const relatedProducts = await getRelatedProducts(productId, categoryId)

  return (
    <>
      {relatedProducts.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  )
}
