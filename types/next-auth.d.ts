import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string
      role: string
      isVerified?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    isVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  /** Extending the built-in JWT types */
  interface JWT {
    id: string
    role: string
    isVerified?: boolean
  }
} 