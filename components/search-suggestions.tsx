"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice: number | null;
  imageUrl: string | null;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: () => void;
}

export default function SearchSuggestions({
  query,
  onSelect,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSuggestions(data.products);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  if (!query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 max-h-[400px] overflow-y-auto z-50">
      {loading ? (
        <div className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#E4191F]" />
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              onClick={onSelect}
            >
              {product.imageUrl && (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {product.discountedPrice !== null ? (
                    <>
                      <span className="text-[#E4191F]">
                        ${product.discountedPrice.toFixed(2)}
                      </span>
                      <span className="ml-2 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span>${product.price.toFixed(2)}</span>
                  )}
                </p>
              </div>
            </Link>
          ))}
          <div className="px-4 py-2 border-t dark:border-neutral-700">
            <button
              onClick={() => {
                router.push(`/products?q=${encodeURIComponent(query)}`);
                onSelect();
              }}
              className="text-sm text-[#E4191F] hover:underline w-full text-left"
            >
              See all results
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-300">
          No products found
        </div>
      )}
    </div>
  );
}
