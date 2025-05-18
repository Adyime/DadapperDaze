import Link from "next/link"
import { getCategories } from "@/lib/categories"

export default async function CategoryList() {
  const categories = await getCategories()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.id}`}
          className="group relative flex flex-col overflow-hidden rounded-lg border bg-background p-6 hover:border-foreground/50 transition-colors"
        >
          <div className="flex flex-1 flex-col">
            <h3 className="font-medium">{category.name}</h3>
            {category.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              {category._count.products} {category._count.products === 1 ? "product" : "products"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 