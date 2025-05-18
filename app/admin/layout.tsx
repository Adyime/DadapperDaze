import Link from "next/link"
import { redirect } from "next/navigation"
import { Package, ShoppingBag, Users, Tag, Ticket, ShoppingCart } from "lucide-react"

import { getCurrentUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Carts",
    href: "/admin/carts",
    icon: ShoppingCart,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
]

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-muted">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="font-semibold">
            Admin Dashboard
          </Link>
        </div>
        <nav className="space-y-1 px-3 py-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="h-16 border-b" />
        <main>{children}</main>
      </div>
    </div>
  )
}
