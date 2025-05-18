import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { invalidateCachePattern } from "@/lib/db"
import { slugify } from "@/lib/utils"

// GET - Get a category by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// PUT - Update a category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, description } = validationResult.data

    // Get the existing category
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Generate slug if name changed
    const slug = name !== existingCategory.name ? slugify(name) : existingCategory.slug

    // Check if slug already exists (if name changed)
    if (name !== existingCategory.name) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })

      if (slugExists) {
        return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
      },
    })

    // Invalidate cache
    await invalidateCachePattern("categories:*")
    await invalidateCachePattern(`category:${existingCategory.slug}`)
    if (slug !== existingCategory.slug) {
      await invalidateCachePattern(`category:${slug}`)
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE - Delete a category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (category._count.products > 0) {
      return NextResponse.json({ error: "Cannot delete category with products" }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    // Invalidate cache
    await invalidateCachePattern("categories:*")
    await invalidateCachePattern(`category:${category.slug}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
