import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { compressImage } from "@/lib/products"
import { invalidateCachePattern } from "@/lib/db"
import { slugify } from "@/lib/utils"

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true
    images: true
    variants: true
  }
}>

// GET - Get a product by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: {
            color: 'asc'
          }
        },
        images: {
          orderBy: [
            { color: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Group images by color
    const images = product.images || []
    const groupedImages = images.reduce((acc: Record<string, typeof images>, img) => {
      const color = img.color || 'default'
      if (!acc[color]) {
        acc[color] = []
      }
      acc[color].push(img)
      return acc
    }, {})

    // Log the response data
    console.log('API Response:', {
      ...product,
      images: images.map(img => ({
        id: img.id,
        color: img.color,
        order: img.order
      })),
      groupedImages: Object.keys(groupedImages).reduce((acc, color) => ({
        ...acc,
        [color]: groupedImages[color].length
      }), {})
    })

    return NextResponse.json({
      ...product,
      images,
      groupedImages
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT - Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()

    // Validate the input
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      price: z.string().transform((val) => parseFloat(val)),
      discountedPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : null)),
      categoryId: z.string().min(1, "Category is required"),
      existingImageIds: z.string().transform((val) => JSON.parse(val) as string[]),
    })

    const validationResult = schema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice"),
      categoryId: formData.get("categoryId"),
      existingImageIds: formData.get("existingImageIds"),
    })

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, description, price, discountedPrice, categoryId, existingImageIds } = validationResult.data

    // Get variants data
    const variants = JSON.parse(formData.get("variants") as string) as Array<{
      color: string
      size: string
      stock: number
      sku: string
    }>

    // Validate variants
    if (variants.length === 0) {
      return NextResponse.json({ error: "At least one variant is required" }, { status: 400 })
    }

    for (const variant of variants) {
      if (!variant.color || !variant.size || !variant.sku) {
        return NextResponse.json({ error: "All variant fields are required" }, { status: 400 })
      }
    }

    // Check for duplicate SKUs (excluding the product's own variants)
    const existingSkus = await prisma.productVariant.findMany({
      where: {
        AND: [
          {
            sku: {
              in: variants.map((v) => v.sku),
            },
          },
          {
            productId: {
              not: id,
            },
          },
        ],
      },
      select: {
        sku: true,
      },
    })

    if (existingSkus.length > 0) {
      return NextResponse.json(
        { error: `SKUs already exist: ${existingSkus.map((s: { sku: string }) => s.sku).join(", ")}` },
        { status: 400 }
      )
    }

    // Get new images and their color associations
    const newImages = formData.getAll("images") as Blob[]
    const imageColors = formData.getAll("imageColors") as string[]

    if (existingImageIds.length === 0 && newImages.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Get existing images to check their colors
    const existingImages = await prisma.productImage.findMany({
      where: { id: { in: existingImageIds } },
      select: { id: true, color: true }
    })

    // Log image data for debugging
    console.log('Product update - image data:', {
      existingImageIds: existingImageIds.length,
      newImages: newImages.length,
      imageColors,
      existingImageColors: existingImages.map(img => img.color),
      variantColors: [...new Set(variants.map(v => v.color))]
    })

    // Build a map of color to images for validation
    const allImagesByColor = new Map<string, number>();
    
    // Add existing images to the map, treating null or empty string as 'default'
    existingImages.forEach(img => {
      const color = img.color || 'default';
      allImagesByColor.set(color, (allImagesByColor.get(color) || 0) + 1);
    });
    
    // Add new images to the map
    imageColors.forEach(color => {
      const normalizedColor = color || 'default';
      allImagesByColor.set(normalizedColor, (allImagesByColor.get(normalizedColor) || 0) + 1);
    });
    
    // Get unique color variants
    const colorVariants = [...new Set(variants.map(v => v.color))];
    
    // Check if each color has at least one image
    // We'll be more lenient and only check major colors, allowing 'default' or null to cover multiple colors
    // if there's not enough color-specific images
    const hasDefaultImages = allImagesByColor.has('default') && allImagesByColor.get('default')! > 0;
    
    // Find colors without specific images
    const missingImageColors = colorVariants.filter(color => {
      // If the color has specific images, it's covered
      if (allImagesByColor.has(color) && allImagesByColor.get(color)! > 0) {
        return false;
      }
      // If there are default images, we'll consider it covered
      return !hasDefaultImages;
    });

    if (missingImageColors.length > 0 && !hasDefaultImages) {
      return NextResponse.json(
        { error: `Missing images for colors: ${missingImageColors.join(", ")}. Please add at least one image for each color variant.` },
        { status: 400 }
      )
    }

    // Update product with new data
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        discountedPrice,
        categoryId,
        // Update images
        images: {
          deleteMany: {
            id: {
              notIn: existingImageIds,
            },
          },
          create: await Promise.all(
            newImages.map(async (image, index) => ({
              image: Buffer.from(await image.arrayBuffer()),
              order: existingImageIds.length + index,
              color: imageColors[index] || null,
            }))
          ),
        },
        // Update variants
        variants: {
          deleteMany: {},
          create: variants,
        },
      },
      include: {
        images: {
          orderBy: [
            { color: 'asc' },
            { order: 'asc' }
          ]
        },
        variants: {
          orderBy: {
            color: 'asc'
          }
        },
        category: true,
      },
    })

    // Group images by color in the response
    const groupedImages = product.images.reduce((acc: Record<string, typeof product.images>, img) => {
      const color = img.color || 'default'
      if (!acc[color]) {
        acc[color] = []
      }
      acc[color].push(img)
      return acc
    }, {})

    // Invalidate cache
    await invalidateCachePattern("products:*")
    await invalidateCachePattern(`product:${product.slug}`)

    return NextResponse.json({
      ...product,
      groupedImages
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id },
    })

    // Invalidate cache
    await invalidateCachePattern("products:*")
    await invalidateCachePattern(`product:${product.slug}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
