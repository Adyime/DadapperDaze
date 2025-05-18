import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect admin routes to admin dashboard
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Check if user is verified for important actions
    if (
      (pathname.startsWith("/checkout") ||
       pathname.startsWith("/orders") ||
       pathname.startsWith("/profile")) &&
      token?.isVerified === false
    ) {
      return NextResponse.redirect(
        new URL("/verification-required", req.url)
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Only apply this middleware to these routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
  ],
}
