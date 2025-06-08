import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash,
  Check,
  User,
  PackageOpen,
  ShoppingBag,
  MapPin,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddressFormDialog from "@/components/address-form-dialog";

export const metadata: Metadata = {
  title: "Manage Addresses",
  description: "View and manage your shipping addresses",
};

async function getUserAddresses(userId: string) {
  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: "desc",
      },
    });
    return addresses;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
}

export default async function AddressesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/profile/addresses");
  }

  const addresses = await getUserAddresses(user.id);
  const hasAddresses = addresses.length > 0;

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-drb-light dark:hover:bg-neutral-800 transition bg-drb-light dark:bg-neutral-800"
            >
              <MapPin className="h-5 w-5" /> Addresses
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button variant="ghost" asChild className="pl-0 w-fit">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Your Addresses</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Manage your shipping and billing addresses
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Add new address card */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Address</CardTitle>
                <CardDescription>
                  Add a new delivery address to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressFormDialog
                  trigger={
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Address
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Display existing addresses or placeholder */}
            {hasAddresses ? (
              addresses.map((address) => (
                <Card key={address.id} className="relative">
                  {address.isDefault && (
                    <Badge className="absolute top-4 right-4 bg-green-100 text-green-800 hover:bg-green-100">
                      Default
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{address.fullName}</CardTitle>
                    <CardDescription>Shipping Address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic space-y-1 text-sm">
                      <p>{address.streetAddress}</p>
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </address>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-4">
                    <AddressFormDialog
                      address={address}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      }
                    />
                    <form
                      action={`/api/addresses/${address.id}/delete`}
                      method="post"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </form>
                    {!address.isDefault && (
                      <form
                        action={`/api/addresses/${address.id}/set-default`}
                        method="post"
                        className="ml-auto"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Set as Default
                        </Button>
                      </form>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">
                    No Saved Addresses
                  </CardTitle>
                  <CardDescription>
                    You haven't saved any addresses yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add your first address by clicking the "Add Address" button.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
