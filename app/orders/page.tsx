import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageOpen, User, ShoppingBag, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { getUserOrders } from "@/lib/orders";
import OrderCard from "@/components/order-card";

export const metadata: Metadata = {
  title: "Your Orders",
  description: "View your order history",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await getUserOrders(user.id);
  const isEmpty = orders.length === 0;

  return (
    <div className="container mx-auto py-8 px-2 md:px-6 lg:px-8 font-sans">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 mb-4 md:mb-0">
          <nav className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 space-y-2 sticky top-24">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition"
            >
              <User className="h-5 w-5" /> Account
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition bg-drb-light dark:bg-neutral-800"
            >
              <PackageOpen className="h-5 w-5" /> Orders
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition"
            >
              <ShoppingBag className="h-5 w-5" /> Cart
            </Link>
            <Link
              href="/profile/addresses"
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition"
            >
              <MapPin className="h-5 w-5" /> Addresses
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet.
              </p>
              <Button asChild size="lg">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
