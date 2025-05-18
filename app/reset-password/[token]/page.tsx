import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { validateResetToken } from "@/lib/auth"
import ResetPasswordForm from "@/components/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password",
}

export default async function ResetPasswordPage({
  params,
}: {
  params: { token: string }
}) {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  const isValidToken = await validateResetToken(params.token)

  if (!isValidToken) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Invalid or Expired Token</h1>
          <p className="text-muted-foreground mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>

        <ResetPasswordForm token={params.token} />

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
