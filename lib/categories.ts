import { cache } from "react"

import { prisma, getCache, setCache } from "@/lib/db"

// Get all categories
export const getCategories = cache(async () => {
  const cacheKey = "categories:all"

  const cachedCategories = await getCache(cacheKey)
  if (cachedCategories) {
    return cachedCategories
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
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
  })

  await setCache(cacheKey, categories, 60 * 30) // Cache for 30 minutes

  return categories
})

// Get category by slug
export const getCategoryBySlug = cache(async (slug: string) => {
  const cacheKey = `category:${slug}`

  const cachedCategory = await getCache(cacheKey)
  if (cachedCategory) {
    return cachedCategory
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (category) {
    await setCache(cacheKey, category, 60 * 30) // Cache for 30 minutes
  }

  return category
})
