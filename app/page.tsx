import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, Shield, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFeaturedProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import CategoryList from "@/components/category-list"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountedPrice: number | null
  imageUrl: string | null
  category: {
    name: string
    slug: string
  }
  images: {
    image: Buffer
  }[]
  variants?: {
    id: string
    color: string
    size: string
    stock: number
  }[]
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative bg-muted/40">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center py-12 md:py-24 gap-8">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Shop the Latest <span className="text-primary">Trends</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Discover our curated collection of premium products at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            <Image
              src="/hero-image.jpg"
              alt="Featured Products"
              width={600}
              height={600}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <Button variant="ghost" asChild>
              <Link href="/categories">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CategoryList />
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Suspense
              fallback={Array(4)
                .fill(null)
                .map((_, i) => <ProductCardSkeleton key={i} />)}
            >
              {featuredProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    imageUrl: null,
                    variants: product.variants || []
                  }} 
                />
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-muted/40 rounded-lg">
            <Truck className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
            <p className="text-muted-foreground">On all orders over $50</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-muted/40 rounded-lg">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
            <p className="text-muted-foreground">100% secure payment</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-muted/40 rounded-lg">
            <ShoppingBag className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
            <p className="text-muted-foreground">30 day return policy</p>
          </div>
        </div>
      </section>
    </div>
  )
}
