import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { prisma } from "@/lib/db"

interface AdminCategoriesListProps {
  query: string
  page: number
}

export default async function AdminCategoriesList({ query, page }: AdminCategoriesListProps) {
  const limit = 10
  const skip = (page - 1) * limit

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }
    : {}

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.category.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-3 p-4 bg-muted/50">
          <div>Name</div>
          <div>Products</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {categories.map((category) => (
            <div key={category.id} className="grid grid-cols-3 p-4 items-center">
              <div>
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-muted-foreground truncate">{category.description}</div>
                )}
              </div>
              <div>{category._count.products}</div>
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}

          {categories.length === 0 && <div className="p-4 text-center text-muted-foreground">No categories found.</div>}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/admin/categories?page=${page - 1}${query ? `&q=${query}` : ""}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/admin/categories?page=${i + 1}${query ? `&q=${query}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`/admin/categories?page=${page + 1}${query ? `&q=${query}` : ""}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
