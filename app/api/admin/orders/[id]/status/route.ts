import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth-options"
import { sendOrderStatusNotification, logOrderStatusChange } from "@/lib/notifications"

// Define validation schema for order status update
const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  notifyCustomer: z.boolean().optional().default(true),
  message: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.id
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = statusUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message || "Invalid status" },
        { status: 400 }
      )
    }

    const { status, notifyCustomer = true, message } = validationResult.data
    
    // Skip if status hasn't changed
    if (existingOrder.status === status) {
      return NextResponse.json({
        id: existingOrder.id,
        status: existingOrder.status,
        message: "Status already set to this value"
      })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    })

    // Log the status change
    await logOrderStatusChange(orderId, status, session.user.id)

    // Send notification to the customer if needed
    let notificationSent = false;
    if (notifyCustomer) {
      // We don't await this to avoid slowing down the API response
      sendOrderStatusNotification(existingOrder, status, message)
        .then(result => {
          notificationSent = result.success;
        })
        .catch(error => {
          console.error("Error sending notification:", error);
        });
    }

    return NextResponse.json({
      ...updatedOrder,
      notificationSent,
      notifyCustomer
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
} 