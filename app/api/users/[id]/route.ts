import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { hash } from "bcryptjs"

// GET - Get user by ID (admin only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT - Update user (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      email: z.string().email("Invalid email").optional(),
      role: z.enum(["USER", "ADMIN"]).optional(),
      password: z.string().min(8, "Password must be at least 8 characters").optional(),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, email, role, password } = validationResult.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already used by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: params.id },
        },
      })

      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) updateData.password = await hash(password, 10)

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting yourself
    if (params.id === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
