import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { generateEmailVerificationToken, generateVerificationEmailHtml, sendMail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the input
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    })

    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Generate verification token and expiry
    const verificationToken = generateEmailVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create the user with verification token in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user first
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      // Then create verification token
      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          expires,
          userId: newUser.id,
        },
      })

      return newUser
    })

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`

    // Send verification email
    await sendMail({
      to: email,
      subject: "Verify your email address",
      html: generateVerificationEmailHtml(name, verificationUrl),
    })

    return NextResponse.json({ 
      ...user, 
      message: "Registration successful. Please check your email to verify your account."
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
