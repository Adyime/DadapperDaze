import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/categories";
import { getSimpleProducts } from "@/lib/products";
import SimpleProductList from "@/components/simple-product-list";
import ProductFilters from "@/components/product-filters";
import ProductListSkeleton from "@/components/product-list-skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our collection of products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categories = await getCategories();

  const categoryId =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? Number.parseInt(searchParams.minPrice)
      : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? Number.parseInt(searchParams.maxPrice)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const page =
    typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page)
      : 1;

  // Fetch products without flattening by variant colors
  const products = await getSimpleProducts({
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  });

  return (
    // <div className="min-h-screen bg-white w-full px-2 sm:px-4 lg:px-8 py-8 md:py-16">
    //   <div className="max-w-7xl mx-auto">
    //     <h1 className="section-title text-center mb-8">All Products</h1>
    //     <div className="flex flex-col md:flex-row gap-8">
    //       {/* Sidebar filters */}
    //       <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
    //         <div className="md:sticky md:top-24 bg-white rounded shadow p-6">
    //           <ProductFilters categories={categories} />
    //         </div>
    //       </aside>
    //       {/* Product grid */}
    //       <main className="flex-1">
    //         <Suspense fallback={<ProductListSkeleton />}>
    //           <div className="bg-white">
    //             <SimpleProductList
    //               initialProducts={products}
    //               categoryId={categoryId}
    //               minPrice={minPrice}
    //               maxPrice={maxPrice}
    //               sort={sort}
    //               page={page}
    //             />
    //           </div>
    //         </Suspense>
    //       </main>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen bg-white w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          All Products
        </h1>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <aside className="w-full md:w-64 flex-shrink-0 mb-4 md:mb-0">
            <div className="md:sticky md:top-24 bg-white rounded shadow p-4 sm:p-6">
              <ProductFilters categories={categories} />
            </div>
          </aside>
          <main className="flex-1">
            <Suspense fallback={<ProductListSkeleton />}>
              <div className="bg-white">
                <SimpleProductList
                  initialProducts={products}
                  categoryId={categoryId}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  sort={sort}
                  page={page}
                />
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
