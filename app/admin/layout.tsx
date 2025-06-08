import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Users,
  Tag,
  Ticket,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
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
];

function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="font-heading font-bold text-lg">
          Admin Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-6 pb-2">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full justify-start bg-drb-pink text-white hover:bg-drb-dark font-heading font-bold rounded-lg shadow-sm transition-all duration-200"
          )}
        >
          Go to Home
        </Link>
        <Link
          href="/api/auth/signout"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full justify-start border-drb-pink text-drb-pink hover:bg-drb-pink hover:text-white font-heading font-bold rounded-lg transition-all duration-200"
          )}
        >
          Logout
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-6 flex-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start hover:bg-drb-pink/10 transition-all duration-200"
            )}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md border">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b bg-white shadow-sm" />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
