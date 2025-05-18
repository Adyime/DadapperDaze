import { compare, hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"

import { prisma } from "@/lib/db"

// Schema for login validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Please enter your password" }),
})

// Schema for registration validation
export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Please enter your name" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Schema for password reset request
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

// Schema for password reset
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Create a password reset token
export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  // Delete any existing reset tokens for this user
  await prisma.resetToken.deleteMany({
    where: { userId: user.id },
  })

  // Create a new reset token
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600000) // 1 hour from now

  await prisma.resetToken.create({
    data: {
      token,
      expires,
      userId: user.id,
    },
  })

  return token
}

// Validate a password reset token
export async function validateResetToken(token: string) {
  const resetToken = await prisma.resetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    return false
  }

  if (resetToken.expires < new Date()) {
    // Token has expired, delete it
    await prisma.resetToken.delete({
      where: { id: resetToken.id },
    })
    return false
  }

  return true
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.resetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return false
  }

  const hashedPassword = await hash(newPassword, 10)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  })

  // Delete the used token
  await prisma.resetToken.delete({
    where: {
      id: resetToken.id,
    },
  })

  return true
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}
