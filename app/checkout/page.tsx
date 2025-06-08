import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserCart } from "@/lib/cart";
import CheckoutForm from "@/components/checkout-form";
import OrderSummary from "@/components/order-summary";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cart = await getUserCart(user.id);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
        Checkout
      </h1>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="border-r border-gray-200 lg:border-r-0 lg:border-b-0">
            <div className="p-6 lg:p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Shipping and Payment
              </h2>
              <CheckoutForm user={user} />
            </div>
          </div>

          <div className="bg-gray-50">
            <div className="p-6 lg:p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              <OrderSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
