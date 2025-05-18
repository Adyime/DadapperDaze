import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { compressImage } from "@/lib/products"
import { invalidateCachePattern } from "@/lib/db"
import { slugify } from "@/lib/utils"

// GET - Get all products
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category") || undefined
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  const sort = searchParams.get("sort") || undefined
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "12")

  try {
    const where: Prisma.ProductWhereInput = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        {
          discountedPrice: {
            gte: minPrice,
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
        {
          AND: [
            { discountedPrice: null },
            {
              price: {
                gte: minPrice,
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            },
          ],
        },
      ]
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {}

    switch (sort) {
      case "price-asc":
        orderBy.price = "asc"
        break
      case "price-desc":
        orderBy.price = "desc"
        break
      case "name-asc":
        orderBy.name = "asc"
        break
      case "name-desc":
        orderBy.name = "desc"
        break
      case "newest":
        orderBy.createdAt = "desc"
        break
      default:
        orderBy.createdAt = "desc"
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            take: 1,
            orderBy: {
              order: 'asc'
            },
        select: {
          id: true,
              image: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST - Create a new product
export async function POST(request: Request) {
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
    })

    const validationResult = schema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice"),
      categoryId: formData.get("categoryId"),
    })

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, description, price, discountedPrice, categoryId } = validationResult.data
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

    // Check for duplicate SKUs
    const existingSkus = await prisma.productVariant.findMany({
      where: {
        sku: {
          in: variants.map((v) => v.sku),
        },
      },
      select: {
        sku: true,
      },
    })

    if (existingSkus.length > 0) {
      return NextResponse.json(
        { error: `SKUs already exist: ${existingSkus.map((sku) => sku.sku).join(", ")}` },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = slugify(name)

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json({ error: "A product with this name already exists" }, { status: 400 })
    }

    // Get all images from formData
    const images = formData.getAll("images") as Blob[]
    const imageColors = formData.getAll("imageColors") as string[]

    if (images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Create product with variants and all images
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        discountedPrice,
        categoryId,
        images: {
          create: await Promise.all(
            images.map(async (image, index) => ({
              image: Buffer.from(await image.arrayBuffer()),
              order: index,
              color: imageColors[index] || null,
            }))
          ),
        },
        variants: {
          create: variants,
        },
      },
      include: {
        images: true,
        variants: true,
      },
    })

    // Invalidate cache
    await invalidateCachePattern("products:*")

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
