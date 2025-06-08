import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  User,
  PackageOpen,
  ShoppingBag,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { getOrderById } from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderItemCard from "@/components/order-item-card";

type OrderPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  return {
    title: `Order #${params.id}`,
    description: "View your order details",
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/orders/" + params.id);
  }

  const order = await getOrderById(params.id, user.id);

  if (!order) {
    notFound();
  }

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
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-6)}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <OrderItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <address className="not-italic">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.streetAddress}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
