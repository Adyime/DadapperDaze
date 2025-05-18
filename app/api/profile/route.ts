import { NextResponse } from "next/server"
import { z } from "zod"
import { hash, compare } from "bcryptjs"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET - Get current user's profile
export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT - Update current user's profile
export async function PUT(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      email: z.string().email("Invalid email").optional(),
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional(),
      image: z.string().url("Invalid image URL").optional().nullable(),
    }).refine(data => {
      // If new password is provided, current password must also be provided
      if (data.newPassword && !data.currentPassword) {
        return false
      }
      return true
    }, {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, email, currentPassword, newPassword, image } = validationResult.data

    // Check if email is already used by another user
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: user.id },
        },
      })

      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Verify current password if changing password
    if (currentPassword && newPassword) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      })

      if (!currentUser?.password) {
        return NextResponse.json({ error: "Password verification failed" }, { status: 400 })
      }

      const isPasswordValid = await compare(currentPassword, currentUser.password)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (image !== undefined) updateData.image = image
    if (newPassword) updateData.password = await hash(newPassword, 10)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
} 