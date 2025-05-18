import type { Order, User } from "@prisma/client"
import { prisma } from "@/lib/db"
import { sendMail } from "@/lib/mail"

type OrderWithUser = Order & {
  user: User
}

/**
 * Sends an email notification about order status change
 */
export async function sendOrderStatusNotification(
  order: OrderWithUser, 
  newStatus: string,
  customMessage?: string
) {
  const { user, id: orderId } = order
  const { email, name } = user
  
  // Skip if user has no email
  if (!email) return { success: false, error: "User has no email" }
  
  // Format order ID for user-friendly display
  const orderNumber = orderId.slice(0, 8).toUpperCase()
  
  // Create email subject and content based on order status
  let subject = `Order #${orderNumber} Update`
  let content = getStatusUpdateEmailContent(orderNumber, newStatus, name, customMessage)
  
  // Send the email notification
  return await sendMail({
    to: email,
    subject,
    html: content,
  })
}

/**
 * Generates the email content for different order statuses
 */
function getStatusUpdateEmailContent(
  orderNumber: string, 
  status: string, 
  customerName: string | null,
  customMessage?: string
): string {
  const userName = customerName || "Valued Customer"
  
  let statusMessage = ""
  let additionalInfo = ""
  
  // Customize message based on status
  switch (status) {
    case "PROCESSING":
      statusMessage = "We're preparing your order for shipment."
      additionalInfo = "Your payment has been received and we're now getting your items ready."
      break
    
    case "SHIPPED":
      statusMessage = "Your order has been shipped!"
      additionalInfo = "Your package is on its way. You'll receive another update when it's delivered."
      break
    
    case "DELIVERED":
      statusMessage = "Your order has been delivered!"
      additionalInfo = "We hope you enjoy your purchase. If you have any questions or feedback, please let us know."
      break
    
    case "CANCELLED":
      statusMessage = "Your order has been cancelled."
      additionalInfo = "If you didn't request this cancellation or have any questions, please contact our customer support."
      break
    
    default:
      statusMessage = `Your order status has been updated to "${status}".`
      additionalInfo = "Check your account for more details."
  }
  
  // Use custom message if provided
  const messageContent = customMessage 
    ? `<p><strong>Message from Da Dapper Daze:</strong> ${customMessage}</p>`
    : `<p>${additionalInfo}</p>`;
  
  // Generate the email HTML
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Order Status Update</h2>
      <p>Hello ${userName},</p>
      <p>Your order <strong>#${orderNumber}</strong> has been updated.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="font-size: 18px; margin: 0 0 10px 0;"><strong>New Status: ${status}</strong></p>
        <p style="margin: 0;">${statusMessage}</p>
      </div>
      
      ${messageContent}
      
      <p style="margin-top: 30px;">Thank you for shopping with Da Dapper Daze!</p>
      <p>If you have any questions about your order, please contact our customer support team.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
        <p>This is an automated email, please do not reply to this message.</p>
      </div>
    </div>
  `
}

/**
 * Logs the order status change in the system
 */
export async function logOrderStatusChange(orderId: string, newStatus: string, adminUserId: string) {
  // In a real application, you might want to log status changes to a database
  console.log(`Order ${orderId} status changed to ${newStatus} by admin ${adminUserId}`)
} 