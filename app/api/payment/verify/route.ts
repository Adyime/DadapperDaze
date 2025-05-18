import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Verify Razorpay payment
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "All payment details are required" },
        { status: 400 }
      );
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update order status to PROCESSING after successful payment
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        paymentIntentId: razorpay_payment_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
} 