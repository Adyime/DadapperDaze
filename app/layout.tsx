import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "NextCommerce | Modern eCommerce Platform",
    template: "%s | NextCommerce",
  },
  description: "A modern eCommerce platform built with Next.js 14, Prisma, and PostgreSQL",
  keywords: ["ecommerce", "nextjs", "prisma", "postgresql", "shopping"],
  authors: [{ name: "NextCommerce Team" }],
  creator: "NextCommerce",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nextcommerce.vercel.app",
    title: "NextCommerce | Modern eCommerce Platform",
    description: "A modern eCommerce platform built with Next.js 14, Prisma, and PostgreSQL",
    siteName: "NextCommerce",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextCommerce | Modern eCommerce Platform",
    description: "A modern eCommerce platform built with Next.js 14, Prisma, and PostgreSQL",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
