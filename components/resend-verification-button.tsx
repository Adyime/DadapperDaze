"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MailIcon } from "lucide-react"

interface ResendVerificationButtonProps {
  email: string
}

export default function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleResendVerification = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      toast({
        title: "Verification email sent",
        description: `A new verification email has been sent to ${email}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="w-full"
      onClick={handleResendVerification}
      disabled={isLoading}
    >
      {isLoading ? (
        "Sending..."
      ) : (
        <>
          <MailIcon className="mr-2 h-4 w-4" /> Resend Verification Email
        </>
      )}
    </Button>
  )
} 