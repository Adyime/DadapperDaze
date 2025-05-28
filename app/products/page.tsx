import { Suspense } from "react"
import type { Metadata } from "next"
import { getCategories } from "@/lib/categories"
import { getSimpleProducts } from "@/lib/products"
import SimpleProductList from "@/components/simple-product-list"
import ProductFilters from "@/components/product-filters"
import ProductListSkeleton from "@/components/product-list-skeleton"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our collection of products",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categories = await getCategories()
  
  const categoryId = typeof searchParams.category === "string" ? searchParams.category : undefined
  const minPrice = typeof searchParams.minPrice === "string" ? Number.parseInt(searchParams.minPrice) : undefined
  const maxPrice = typeof searchParams.maxPrice === "string" ? Number.parseInt(searchParams.maxPrice) : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1

  // Fetch products without flattening by variant colors
  const products = await getSimpleProducts({
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  })

  return (
    <div className="min-h-screen bg-drb-light w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="section-title">All Products</h1>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
          <ProductFilters categories={categories} />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<ProductListSkeleton />}>
            <SimpleProductList 
              initialProducts={products} 
              categoryId={categoryId} 
              minPrice={minPrice} 
              maxPrice={maxPrice} 
              sort={sort}
              page={page} 
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
