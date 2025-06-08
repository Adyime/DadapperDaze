"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import MobileNav from "@/components/mobile-nav";
import CartPreview from "@/components/cart-preview";
import SearchSuggestions from "@/components/search-suggestions";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all bg-white backdrop-blur border-b border-drb-light shadow-sm",
        isScrolled && "shadow-md bg-white/40"
      )}
    >
      <div className="max-w-5xl mx-auto flex h-[7vh] items-center justify-between px-4 sm:px-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="">
            <Image src={"/logo.png"} alt="logo" width={150} height={150} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className={cn(
                " text-base font-sans transition-colors hover:text-[#E4191F]",
                pathname === "/products" ? "text-[#E4191F]" : "text-black"
              )}
            >
              Products
            </Link>
            <Link
              href="/about"
              className={cn(
                " text-base font-sans transition-colors hover:text-[#E4191F]",
                pathname === "/about" ? "text-[#E4191F]" : "text-black"
              )}
            >
              About
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            {showSearch ? (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-[300px] pr-8 rounded-full border-drb-light bg-drb-light/60 text-drb-dark placeholder:text-drb-gray"
                  autoFocus
                  onBlur={(e) => {
                    // Only hide search if not clicking within suggestions
                    if (!e.relatedTarget?.closest(".search-suggestions")) {
                      setShowSearch(false);
                      setSearchQuery("");
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="link"
                  className="absolute right-0 top-0 h-full px-3 text-[#E4191F]"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
                <div className="search-suggestions">
                  <SearchSuggestions
                    query={searchQuery}
                    onSelect={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                  />
                </div>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-[#E4191F]"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#E4191F]"
              >
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
                <Button variant="ghost" size="icon" className="text-[#E4191F]">
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
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="font-heading text-[#E4191F]"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[#E4191F]"
              >
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
  );
}
