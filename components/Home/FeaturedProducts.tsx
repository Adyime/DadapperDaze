import React from "react";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className=" text-[#E4191F] font-sans md:text-2xl ">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-[#E4191F] font-sans md:text-2xl hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="ml-1 h-5 w-5" />
          </Link>
        </div>

        {/* Carousel on mobile, grid on larger screens */}
        <div className="w-full  overflow-x-auto md:overflow-visible scroll-smooth hide-scrollbar">
          <div className="flex gap-6 md:flex-wrap md:grid md:grid-cols-4 min-w-[600px] md:min-w-0">
            <ProductCard products={products} />
          </div>
        </div>
      </div>
    </section>
  );
}
