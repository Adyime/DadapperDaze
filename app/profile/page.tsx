import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PackageOpen,
  Heart,
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import ProfileForm from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View and update your profile information",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  // Ensure we pass a properly serialized object to the client component
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition"
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
            {/* Future: Wishlist, Payment Methods, etc. */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Manage your account and view your orders
            </p>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* Orders Summary */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <PackageOpen className="h-5 w-5" />
                    <span>Your Orders</span>
                  </CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View order status, track shipments, and manage returns.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between"
                    asChild
                  >
                    <Link href="/orders">
                      View Orders <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Shopping Cart */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Shopping Cart</span>
                  </CardTitle>
                  <CardDescription>Review items in your cart</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Check out items in your cart or saved for later.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between"
                    asChild
                  >
                    <Link href="/cart">
                      View Cart <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Addresses */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>Addresses</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your shipping addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove your delivery addresses.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between"
                    asChild
                  >
                    <Link href="/profile/addresses">
                      Manage Addresses <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Profile Form in a Card */}
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Account Information
              </CardTitle>
              <CardDescription>
                Update your personal details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={safeUser} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
