import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Initialize Razorpay payment
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, orderId } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpay = new (require("razorpay"))({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // If we have an order ID, update it with the payment intent ID
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentIntentId: razorpayOrder.id },
      });
    }

    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
} 