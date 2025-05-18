import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import LoginForm from "@/components/login-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string, verified?: string }
}) {
  const user = await getCurrentUser()

  if (user) {
    redirect(searchParams.callbackUrl || "/")
  }

  const isVerified = searchParams.verified === "true"

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        {isVerified && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Email verified successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your email has been verified. You can now log in to your account.
            </AlertDescription>
          </Alert>
        )}

        <LoginForm callbackUrl={searchParams.callbackUrl} />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href={`/register${searchParams.callbackUrl ? `?callbackUrl=${searchParams.callbackUrl}` : ""}`}
              className="text-primary hover:underline"
            >
              Register
            </Link>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
