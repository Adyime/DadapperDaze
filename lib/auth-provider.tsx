"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth">
      {children}
    </SessionProvider>
  )
}
