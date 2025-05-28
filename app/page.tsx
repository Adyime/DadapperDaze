import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFeaturedProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import { Product } from "@/types"

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="flex flex-col min-h-screen bg-drb-light">
      {/* Hero Section */}
      <section className="w-full relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-drb-pink/10 to-drb-light px-4 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-2xl text-center z-10">
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-drb-dark mb-6 leading-tight">
            Shop the Latest <span className="text-drb-pink">Women's Fashion</span>
          </h1>
          <p className="text-drb-gray text-lg md:text-xl mb-8 font-body">
            Discover trending styles, bold colors, and timeless classics for every occasion.
          </p>
          <Link href="/products" className="btn-pink inline-block">
            Shop Now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 hidden md:block opacity-30 pointer-events-none select-none">
          <Image src="/hero-banner.jpg" alt="Hero" width={420} height={420} className="rounded-full shadow-2xl" />
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h2 className="section-title">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href="/categories/men" className="card flex flex-col items-center justify-center p-6 group">
            <Image src="/category-men.jpg" alt="Men's Fashion" width={120} height={120} className="rounded-full mb-4 group-hover:scale-105 transition-transform" />
            <span className="font-heading text-lg text-drb-dark">Men</span>
          </Link>
          <Link href="/categories/women" className="card flex flex-col items-center justify-center p-6 group">
            <Image src="/category-women.jpg" alt="Women's Fashion" width={120} height={120} className="rounded-full mb-4 group-hover:scale-105 transition-transform" />
            <span className="font-heading text-lg text-drb-dark">Women</span>
          </Link>
          <Link href="/categories/accessories" className="card flex flex-col items-center justify-center p-6 group">
            <Image src="/category-accessories.jpg" alt="Accessories" width={120} height={120} className="rounded-full mb-4 group-hover:scale-105 transition-transform" />
            <span className="font-heading text-lg text-drb-dark">Accessories</span>
          </Link>
          <Link href="/categories/footwear" className="card flex flex-col items-center justify-center p-6 group">
            <Image src="/category-footwear.jpg" alt="Footwear" width={120} height={120} className="rounded-full mb-4 group-hover:scale-105 transition-transform" />
            <span className="font-heading text-lg text-drb-dark">Footwear</span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">Featured Products</h2>
            <Link href="/products" className="text-drb-pink font-heading hover:underline flex items-center gap-1">
              View All <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Suspense
              fallback={Array(4)
                .fill(null)
                .map((_, i) => <ProductCardSkeleton key={i} />)}
            >
              {featuredProducts.slice(0, 8).map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Collections Grid (optional, can be added for more visual interest) */}
      {/*
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h2 className="section-title">Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/collections/summer" className="card group relative h-[320px] overflow-hidden flex items-end">
            <Image src="/collection-summer.jpg" alt="Summer Collection" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-drb-dark/70 to-transparent" />
            <div className="relative z-10 p-8">
              <h3 className="font-heading text-2xl text-white mb-2">Summer Collection</h3>
              <p className="text-drb-light">Shop the latest summer styles</p>
            </div>
          </Link>
          <Link href="/collections/winter" className="card group relative h-[320px] overflow-hidden flex items-end">
            <Image src="/collection-winter.jpg" alt="Winter Collection" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-drb-dark/70 to-transparent" />
            <div className="relative z-10 p-8">
              <h3 className="font-heading text-2xl text-white mb-2">Winter Collection</h3>
              <p className="text-drb-light">Discover cozy winter wear</p>
            </div>
          </Link>
        </div>
      </section>
      */}
    </div>
  )
}
