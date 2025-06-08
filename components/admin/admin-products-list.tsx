import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { prisma } from "@/lib/db";

interface AdminProductsListProps {
  query: string;
  categoryId?: string;
  page: number;
}

export default async function AdminProductsList({
  query,
  categoryId,
  page,
}: AdminProductsListProps) {
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountedPrice: true,
        images: {
          select: {
            id: true,
            image: true,
          },
          take: 1,
          orderBy: {
            order: "asc",
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-5 p-4 bg-muted/50">
          <div>Image</div>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-5 p-4 items-center">
              <div className="relative w-16 h-16">
                {product.images[0] ? (
                  <Image
                    src={`data:image/jpeg;base64,${Buffer.from(
                      product.images[0].image
                    ).toString("base64")}`}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg" />
                )}
              </div>
              <div>
                <div className="font-medium">{product.name}</div>
              </div>
              <div>{product.category.name}</div>
              <div>
                {product.discountedPrice ? (
                  <div className="space-y-1">
                    <div className="font-medium">{product.discountedPrice}</div>
                    <div className="text-sm text-muted-foreground line-through">
                      {product.price}
                    </div>
                  </div>
                ) : (
                  <div className="font-medium">{product.price}</div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No products found.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/admin/products?page=${page - 1}${
                    query ? `&q=${query}` : ""
                  }${categoryId ? `&category=${categoryId}` : ""}`}
                />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/admin/products?page=${i + 1}${
                    query ? `&q=${query}` : ""
                  }${categoryId ? `&category=${categoryId}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={`/admin/products?page=${page + 1}${
                    query ? `&q=${query}` : ""
                  }${categoryId ? `&category=${categoryId}` : ""}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
