import { Suspense } from "react"
import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ProductListProps {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
}

export default async function ProductList({
  categoryId,
  minPrice,
  maxPrice,
  sort,
  page = 1,
}: ProductListProps) {
  const { products, pagination } = await getProducts({
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Suspense
          fallback={Array(12)
            .fill(null)
            .map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Suspense>
      </div>

      {pagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/products?page=${page - 1}${
                    categoryId ? `&category=${categoryId}` : ""
                  }${minPrice ? `&minPrice=${minPrice}` : ""}${
                    maxPrice ? `&maxPrice=${maxPrice}` : ""
                  }${sort ? `&sort=${sort}` : ""}`}
                />
              </PaginationItem>
            )}
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/products?page=${i + 1}${
                    categoryId ? `&category=${categoryId}` : ""
                  }${minPrice ? `&minPrice=${minPrice}` : ""}${
                    maxPrice ? `&maxPrice=${maxPrice}` : ""
                  }${sort ? `&sort=${sort}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page < pagination.pages && (
              <PaginationItem>
                <PaginationNext
                  href={`/products?page=${page + 1}${
                    categoryId ? `&category=${categoryId}` : ""
                  }${minPrice ? `&minPrice=${minPrice}` : ""}${
                    maxPrice ? `&maxPrice=${maxPrice}` : ""
                  }${sort ? `&sort=${sort}` : ""}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      )}
    </div>
  )
} 