"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface ProductFiltersProps {
  categories: {
    id: string
    name: string
    slug: string
  }[]
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Categories</h3>
        <div className="mt-4 space-y-2">
          <Button
            variant={!searchParams.get("category") ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => router.push("/products")}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={searchParams.get("category") === category.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() =>
                router.push(`/products?${createQueryString("category", category.id)}`)
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Price Range</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              min="0"
              value={searchParams.get("minPrice") || ""}
              onChange={(e) =>
                router.push(`/products?${createQueryString("minPrice", e.target.value)}`)
              }
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              min="0"
              value={searchParams.get("maxPrice") || ""}
              onChange={(e) =>
                router.push(`/products?${createQueryString("maxPrice", e.target.value)}`)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Sort By</h3>
        <div className="mt-4">
          <Select
            value={searchParams.get("sort") || "newest"}
            onValueChange={(value) =>
              router.push(`/products?${createQueryString("sort", value)}`)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/products")}
      >
        Clear Filters
      </Button>
    </div>
  )
} 