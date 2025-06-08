"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/product-card-skeleton";
import SimpleProductCard from "@/components/simple-product-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SimpleProductListProps {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  initialProducts: {
    products: any[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  };
}

export default function SimpleProductList({
  categoryId,
  minPrice,
  maxPrice,
  sort,
  page = 1,
  initialProducts,
}: SimpleProductListProps) {
  const [products, setProducts] = useState(initialProducts.products);
  const [pagination, setPagination] = useState(initialProducts.pagination);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProducts(initialProducts.products);
    setPagination(initialProducts.pagination);
  }, [initialProducts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
        {loading
          ? Array(12)
              .fill(null)
              .map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <SimpleProductCard key={product.id} product={product} />
            ))}
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
  );
}
