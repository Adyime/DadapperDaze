import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import RegisterForm from "@/components/register-form"

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const user = await getCurrentUser()

  if (user) {
    redirect(searchParams.callbackUrl || "/")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>

        <RegisterForm callbackUrl={searchParams.callbackUrl} />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login${searchParams.callbackUrl ? `?callbackUrl=${searchParams.callbackUrl}` : ""}`}
              className="text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
