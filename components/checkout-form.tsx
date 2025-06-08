"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { loadScript } from "@/lib/razorpay";
import AddressSelector from "@/components/address-selector";
import { Address } from "@/components/address-form-dialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Load Razorpay script
    loadScript("https://checkout.razorpay.com/v1/checkout.js");

    // Get cart total for Razorpay payment amount
    async function getCartTotal() {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        setCartTotal(data.subtotal || 0);
      } catch (error) {
        console.error("Error fetching cart total:", error);
      }
    }

    getCartTotal();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "RAZORPAY",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!selectedAddress) {
      toast({
        title: "Error",
        description: "Please select or add a shipping address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (values.paymentMethod === "RAZORPAY") {
        // Create a pending order first to get the order ID
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethod: "RAZORPAY",
            shippingAddress: {
              fullName: selectedAddress.fullName,
              streetAddress: selectedAddress.streetAddress,
              city: selectedAddress.city,
              state: selectedAddress.state,
              postalCode: selectedAddress.postalCode,
              country: selectedAddress.country,
            },
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || "Failed to create order");
        }

        const orderData = await orderResponse.json();
        setOrderData(orderData);

        // Open Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: cartTotal * 100, // Razorpay expects amount in smallest currency unit (paise)
          currency: "INR",
          name: "Da Dapper Daze",
          description: "Payment for your order",
          order_id: orderData.paymentIntentId,
          handler: async function (response: any) {
            // Process payment success
            const paymentResponse = await fetch(`/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderData.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (paymentResponse.ok) {
              toast({
                title: "Payment successful",
                description: "Thank you for your purchase!",
              });

              router.push(`/orders/${orderData.id}`);
            } else {
              const errorData = await paymentResponse.json();
              throw new Error(errorData.error || "Payment verification failed");
            }
          },
          prefill: {
            name: selectedAddress.fullName,
            email: user.email || "",
          },
          theme: {
            color: "#6366F1",
          },
        };

        const razorpay = (window as any).Razorpay(options);
        razorpay.open();
        setIsSubmitting(false);
        return;
      }

      // For COD or other payment methods, create order directly
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: values.paymentMethod,
          shippingAddress: {
            fullName: selectedAddress.fullName,
            streetAddress: selectedAddress.streetAddress,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });

      router.push(`/orders/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <AddressSelector
        userId={user.id}
        onSelect={handleAddressSelect}
        selectedAddressId={selectedAddress?.id}
      />

      <div className="border-t my-6 pt-6">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="RAZORPAY"
                          id="payment-online"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="payment-online"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 cursor-pointer hover:bg-muted/5",
                            "peer-data-[state=checked]:border-primary",
                            field.value === "RAZORPAY" &&
                              "border-primary bg-primary/5"
                          )}
                        >
                          <CreditCard className="mb-3 h-6 w-6" />
                          <div className="font-medium">Pay Online</div>
                        </label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="COD"
                          id="payment-cod"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="payment-cod"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 cursor-pointer hover:bg-muted/5",
                            "peer-data-[state=checked]:border-primary",
                            field.value === "COD" &&
                              "border-primary bg-primary/5"
                          )}
                        >
                          <Truck className="mb-3 h-6 w-6" />
                          <div className="font-medium">Cash on Delivery</div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedAddress}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>

            {!selectedAddress && (
              <p className="text-sm text-destructive mt-2">
                Please select or add a shipping address to continue.
              </p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
