import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MailCheck } from "lucide-react"

import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ResendVerificationButton from "@/components/resend-verification-button"

export const metadata: Metadata = {
  title: "Email Verification Required",
  description: "Please verify your email address to continue",
}

export default async function VerificationRequiredPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // If user is already verified, redirect to home
  if (user.isVerified) {
    redirect("/")
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card className="border-amber-300 bg-amber-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-4">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-amber-800 text-xl">Email Verification Required</CardTitle>
          <CardDescription className="text-amber-700 mt-1">
            Please verify your email address to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-amber-700">
          <p>
            We sent a verification link to <strong>{user.email}</strong>.
            Please check your email inbox and click the link to verify your account.
          </p>
          <p className="mt-4 text-sm">
            If you didn't receive an email, please check your spam folder or
            click the button below to resend the verification email.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <ResendVerificationButton email={user.email} />
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 