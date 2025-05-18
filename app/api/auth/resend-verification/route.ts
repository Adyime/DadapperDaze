import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth-options"
import { generateEmailVerificationToken, generateVerificationEmailHtml, sendMail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, isVerified: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user is already verified, don't send another email
    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" })
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    })

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        expires,
        userId: user.id,
      },
    })

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`

    // Send verification email
    await sendMail({
      to: user.email,
      subject: "Verify your email address",
      html: generateVerificationEmailHtml(user.name || 'User', verificationUrl),
    })

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
} 