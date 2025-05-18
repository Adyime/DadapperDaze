import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return new Response("Missing verification token", { status: 400 })
    }

    // Find the verification token
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationRecord) {
      return new Response("Invalid verification token", { status: 400 })
    }

    // Check if token is expired
    if (verificationRecord.expires < new Date()) {
      return new Response("Token expired", { status: 400 })
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { 
        isVerified: true,
        emailVerified: new Date(),
      },
    })

    // Delete the token
    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    })

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?verified=true`
    )
  } catch (error) {
    console.error("Error verifying email:", error)
    return new Response("Failed to verify email", { status: 500 })
  }
} 