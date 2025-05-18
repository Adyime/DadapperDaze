import ProductCardSkeleton from "@/components/product-card-skeleton"

export default function ProductListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(12)
          .fill(null)
          .map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
      </div>
    </div>
  )
} 