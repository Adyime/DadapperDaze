"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

interface ProductCardProps {
  products: Product[];
}

export default function ProductCard({ products }: ProductCardProps) {
  return (
    <>
      {products.map((product: Product) => {
        // Get the first color option's image or fall back to first image in colorOptions
        const firstColorOption = product.colorOptions?.[0];
        const imageToShow = firstColorOption?.image || null;
        const imageUrl = imageToShow?.image || "/placeholder.jpg";

        return (
          <Link
            href={`/products/${product.slug}`}
            key={product.id}
            className="group block min-w-[250px] max-w-[250px] md:min-w-0 md:max-w-none flex-shrink-0"
          >
            <article className="bg-white  shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-2 hover:border-gray-200 h-full flex flex-col w-full">
              {/* Image Container */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
                {/* Overlay gradient for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content Container */}
              <div className="flex flex-col flex-grow p-5 space-y-3">
                {/* Product Name */}
                <h2 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                  {product.name}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-grow">
                  {product.description}
                </p>

                {/* Price Section */}
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>
                  {product.discountedPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.discountedPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {Math.round(
                          ((product.discountedPrice - product.price) /
                            product.discountedPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Category Tag */}
                {product.category?.name && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                      {product.category.name}
                    </span>
                  </div>
                )}
              </div>
            </article>
          </Link>
        );
      })}
    </>
  );
}
