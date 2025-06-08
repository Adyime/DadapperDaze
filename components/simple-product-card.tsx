"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

interface SimpleProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice: number | null;
    category: {
      name: string;
      slug: string;
    };
    images: {
      id: string;
      image: string | null;
      color?: string | null;
    }[];
    variants: {
      id: string;
      color: string;
      size: string;
      stock: number;
    }[];
  };
}

export default function SimpleProductCard({ product }: SimpleProductCardProps) {
  const discount = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  const [imageError, setImageError] = useState(false);

  // Get unique colors from variants
  const uniqueColors = [
    ...new Set(product.variants.map((variant) => variant.color)),
  ];

  // Create a map of color to image and variant information
  const colorImagesMap = uniqueColors.map((color) => {
    const colorImages = product.images.filter((img) => img.color === color);
    const firstImage =
      colorImages.length > 0 ? colorImages[0] : product.images[0] || null;

    const variant =
      product.variants.find((v) => v.color === color && v.stock > 0) || null;

    return {
      color,
      image: firstImage,
      variantId: variant?.id,
      inStock: !!variant,
    };
  });

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const selectedColor = colorImagesMap[selectedColorIndex] || colorImagesMap[0];

  const hasImage = Boolean(selectedColor?.image?.image) && !imageError;
  const imageUrl =
    selectedColor?.image?.image || "/placeholder.svg?height=400&width=400";

  return (
    <div className="bg-white  border shadow-xl border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Image Container - Fixed Height */}
      <div className="relative h-64 bg-gray-50">
        <Link href={`/products/${product.slug}`} className="block h-full">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={`${product.name} - ${selectedColor?.color || "Product"}`}
              width={400}
              height={256}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">No Image</span>
              </div>
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1">
              -{discount}%
            </Badge>
          </div>
        )}
      </div>

      {/* Content Container - Flexible Height */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {product.category.name}
          </span>
        </div>

        {/* Product Name */}
        <div className="mb-3">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 text-base leading-tight hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price - Consistent Height */}
        <div className="mb-4 min-h-[2rem] flex items-center">
          {product.discountedPrice ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(product.discountedPrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="font-bold text-lg text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Color Selection - Only show if multiple colors */}
        {colorImagesMap.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedColor?.color}
              </span>
              <span className="text-xs text-gray-500">
                {colorImagesMap.length} colors
              </span>
            </div>
            <div className="flex gap-1.5">
              {colorImagesMap.slice(0, 6).map((item, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    item.inStock
                      ? "cursor-pointer hover:scale-110"
                      : "opacity-40 cursor-not-allowed"
                  } ${
                    selectedColorIndex === index
                      ? "ring-2 ring-offset-1 ring-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: item.color.toLowerCase(),
                  }}
                  title={`${item.color}${
                    !item.inStock ? " (Out of stock)" : ""
                  }`}
                  onClick={() => {
                    if (item.inStock) {
                      setSelectedColorIndex(index);
                      setImageError(false);
                    }
                  }}
                  disabled={!item.inStock}
                />
              ))}
              {colorImagesMap.length > 6 && (
                <span className="text-xs text-gray-500 self-center ml-1">
                  +{colorImagesMap.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Add to Cart Button - Always at bottom */}
        <div className="mt-auto">
          <SimpleAddToCartButton
            product={product}
            selectedVariantId={selectedColor?.variantId}
            hasStock={!!selectedColor?.inStock}
          />
        </div>
      </div>
    </div>
  );
}

function SimpleAddToCartButton({
  product,
  selectedVariantId,
  hasStock,
}: {
  product: SimpleProductCardProps["product"];
  selectedVariantId: string | undefined;
  hasStock: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddToCart() {
    if (!session) {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (!hasStock || !selectedVariantId) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || !hasStock}
      className={`w-full py-2.5 text-sm font-medium rounded-md transition-colors ${
        hasStock
          ? "bg-gray-900 hover:bg-gray-800 text-white"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : hasStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  );
}
