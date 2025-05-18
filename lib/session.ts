import { cookies } from "next/headers"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"

// Get the current session
export async function getSession() {
  return await getServerSession(authOptions)
}

// Get the current user
export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerified: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Get the current cart ID from cookies
export async function getCartId() {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("cartId")?.value
  } catch (error) {
    console.error("Error getting cart ID from cookies:", error);
    return null;
  }
}
