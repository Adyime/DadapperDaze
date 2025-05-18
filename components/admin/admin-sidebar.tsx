"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, ShoppingBag, Tag, Users } from "lucide-react"

import { cn } from "@/lib/utils"

export default function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: Tag,
    },
  ]

  return (
    <div className="w-64 bg-muted/40 h-screen border-r">
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center border-b px-6">
          <Link href="/admin" className="font-semibold text-lg">
            Admin Dashboard
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === link.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
