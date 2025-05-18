import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCache, setCache } from "@/lib/db"

// GET - Get product images by product ID and color
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const color = searchParams.get("color")
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }
    
    // Create a cache key based on the query parameters
    const cacheKey = `product-images:${productId}:${color || 'all'}`
    
    // Try to get from cache first
    const cachedImages = await getCache(cacheKey)
    if (cachedImages) {
      console.log(`Serving cached images for product ${productId}, color ${color || 'all'}`)
      return NextResponse.json(cachedImages)
    }
    
    // Build the query
    const where: any = { productId }
    if (color) {
      where.color = color
    }
    
    console.log(`Fetching images for product ${productId}, color ${color || 'all'}`)
    
    // Fetch the images
    const images = await prisma.productImage.findMany({
      where,
      orderBy: [
        { color: 'asc' },
        { order: 'asc' }
      ],
      select: {
        id: true,
        color: true,
        order: true,
        // Don't include the image binary data in the response
        // Images will be fetched individually from /api/product-images/[id]
      }
    })
    
    // Process the images to include URLs
    const processedImages = images.map(img => ({
      ...img,
      imageUrl: `/api/product-images/${img.id}`
    }))
    
    // Group by color
    const groupedImages = processedImages.reduce<Record<string, typeof processedImages>>((acc, img) => {
      const imgColor = img.color || 'default'
      if (!acc[imgColor]) {
        acc[imgColor] = []
      }
      acc[imgColor].push(img)
      return acc
    }, {})
    
    const response = {
      images: processedImages,
      groupedImages
    }
    
    // Cache the result for 5 minutes
    await setCache(cacheKey, response, 60 * 5)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching product images:", error)
    return NextResponse.json({ error: "Failed to fetch product images" }, { status: 500 })
  }
} 