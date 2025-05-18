import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }

      // If user is already logged in, check if we need to refresh their data
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
          token.role = dbUser.role
        }
      }

      return token
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // If user signs in with Google, mark them as verified
      if (account?.provider === "google" && user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            isVerified: true,
            emailVerified: new Date()
          }
        })
      }
    }
  }
}
