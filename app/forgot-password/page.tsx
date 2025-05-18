import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import ForgotPasswordForm from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
}

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>

        <ForgotPasswordForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
