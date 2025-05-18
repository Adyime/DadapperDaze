"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showSearch, setShowSearch] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="flex flex-col h-full gap-6 p-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          NextCommerce
        </Link>
      </div>

      {showSearch ? (
        <form action="/products" className="relative">
          <Input
            type="search"
            name="q"
            placeholder="Search products..."
            className="w-full pr-8"
            autoFocus
            onBlur={() => setShowSearch(false)}
          />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowSearch(true)}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      )}

      <div className="space-y-1">
        <Link
          href="/"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium",
            pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Home
        </Link>
        <Link
          href="/products"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium",
            pathname === "/products" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Products
        </Link>
        <Link
          href="/categories"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium",
            pathname === "/categories" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Categories
        </Link>
      </div>

      {session ? (
        <>
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Account</p>
            <Link
              href="/profile"
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              Profile
            </Link>
            <Link
              href="/orders"
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/orders" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              Orders
            </Link>
            <Link
              href="/cart"
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/cart" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              Cart
            </Link>
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Admin</p>
              <Link
                href="/admin"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/admin" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/admin/products" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                Products
              </Link>
              <Link
                href="/admin/categories"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/admin/categories" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                Categories
              </Link>
              <Link
                href="/admin/users"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/admin/users" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                Users
              </Link>
              <Link
                href="/admin/coupons"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/admin/coupons" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                Coupons
              </Link>
            </div>
          )}

          <div className="mt-auto">
            <Link
              href="/api/auth/signout"
              className="block w-full rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Logout
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-auto space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
