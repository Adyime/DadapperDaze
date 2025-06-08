// import type { Metadata } from "next";
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { ShoppingCart } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { getCurrentUser } from "@/lib/session";
// import { getUserCart } from "@/lib/cart";
// import CartItem from "@/components/cart-item";
// import CartSummary from "@/components/cart-summary";

// export const metadata: Metadata = {
//   title: "Shopping Cart",
//   description: "View and manage your shopping cart",
// };

// export default async function CartPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login?callbackUrl=/cart");
//   }

//   const cart = await getUserCart(user.id);
//   const isEmpty = cart.items.length === 0;

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

//       {isEmpty ? (
//         <div className="flex flex-col items-center justify-center py-12 text-center">
//           <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
//           <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
//           <p className="text-muted-foreground mb-6">
//             Looks like you haven't added anything to your cart yet.
//           </p>
//           <Button asChild size="lg">
//             <Link href="/products">Start Shopping</Link>
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <div className="space-y-4">
//               {cart.items.map((item) => (
//                 <CartItem key={item.id} item={item} />
//               ))}
//             </div>
//           </div>

//           <div>
//             <CartSummary cart={cart} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { getUserCart } from "@/lib/cart";
import CartItem from "@/components/cart-item";
import CartSummary from "@/components/cart-summary";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View and manage your shopping cart",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/cart");
  }

  const cart = await getUserCart(user.id);
  const isEmpty = cart.items.length === 0;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </div>
  );
}
