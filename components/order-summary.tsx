"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OrderSummaryProps {
  cart: {
    id: string;
    userId: string;
    items: Array<{
      id: string;
      product: {
        name: string;
        discountedPrice: number | null;
        price: number;
      };
      quantity: number;
    }>;
    subtotal: number;
    total: number;
  };
}

interface CouponData {
  coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  discount: number;
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon) as CouponData;
        setAppliedCoupon(couponData);
        setDiscount(couponData.discount);

        revalidateCoupon(couponData.coupon.code, true);
      } catch (error) {
        console.error("Error parsing saved coupon:", error);
        localStorage.removeItem("appliedCoupon");
      }
    }
  }, [cart.subtotal]);

  async function revalidateCoupon(code: string, silent = false) {
    if (!silent) setIsApplying(true);
    setCouponError(null);

    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal: cart.subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (!silent) {
          setCouponError(data.error || "Invalid coupon code");
        } else {
          localStorage.removeItem("appliedCoupon");
          setAppliedCoupon(null);
          setDiscount(0);
        }
        return;
      }

      setAppliedCoupon(data);
      setDiscount(data.discount);
      localStorage.setItem("appliedCoupon", JSON.stringify(data));

      if (!silent) {
        toast({
          title: "Coupon applied",
          description: `Discount: ${formatPrice(data.discount)}`,
        });
      }
    } catch (error: any) {
      if (!silent) {
        setCouponError(error.message || "Could not apply coupon");
      }
    } finally {
      if (!silent) setIsApplying(false);
    }
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();

    if (!couponCode.trim()) return;

    await revalidateCoupon(couponCode);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError(null);
    localStorage.removeItem("appliedCoupon");
  }

  const total = cart.subtotal - discount;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.product.name}{" "}
                <span className="text-gray-400">x{item.quantity}</span>
              </span>
              <span className="font-medium">
                {formatPrice(
                  (item.product.discountedPrice || item.product.price) *
                    item.quantity
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium">Free</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 mt-2 font-bold text-gray-800">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {appliedCoupon.coupon.code}
              </p>
              <p className="text-xs text-gray-500">
                {formatPrice(discount)} discount
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <form onSubmit={applyCoupon} className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null);
                }}
                className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isApplying}
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-50"
              >
                Apply
              </Button>
            </form>

            {couponError && (
              <Alert
                variant="destructive"
                className="py-2 text-sm bg-red-50 border-red-200 text-red-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{couponError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
