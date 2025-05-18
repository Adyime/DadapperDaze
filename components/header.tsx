"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu, Search, ShoppingCart, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import MobileNav from "@/components/mobile-nav"
import CartPreview from "@/components/cart-preview"

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all",
        isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-background",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            NextCommerce
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/products" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/categories" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative">
            {showSearch ? (
              <form action="/products" className="relative">
                <Input
                  type="search"
                  name="q"
                  placeholder="Search products..."
                  className="w-[200px] pr-8"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Open cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
              <CartPreview />
            </SheetContent>
          </Sheet>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
