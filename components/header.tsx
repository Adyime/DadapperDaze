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
        "sticky top-0 z-50 w-full transition-all bg-white/90 backdrop-blur border-b border-drb-light shadow-sm",
        isScrolled && "shadow-md"
      )}
    >
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading text-2xl font-extrabold text-drb-pink tracking-tight">
            DaDapperDaze
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className={cn(
                "font-heading text-base font-semibold transition-colors hover:text-drb-pink",
                pathname === "/products" ? "text-drb-pink" : "text-drb-gray"
              )}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={cn(
                "font-heading text-base font-semibold transition-colors hover:text-drb-pink",
                pathname === "/categories" ? "text-drb-pink" : "text-drb-gray"
              )}
            >
              Categories
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            {showSearch ? (
              <form action="/products" className="relative">
                <Input
                  type="search"
                  name="q"
                  placeholder="Search products..."
                  className="w-[200px] pr-8 rounded-full border-drb-light bg-drb-light/60 text-drb-dark placeholder:text-drb-gray"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full px-3 text-drb-pink">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" className="text-drb-pink" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-drb-pink">
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">Open cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
              <CartPreview />
            </SheetContent>
          </Sheet>

          {/* User */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-drb-pink">
                  <User className="h-6 w-6" />
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
            <Button variant="ghost" size="sm" asChild className="font-heading text-drb-pink">
              <Link href="/login">Login</Link>
            </Button>
          )}

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-drb-pink">
                <Menu className="h-6 w-6" />
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
