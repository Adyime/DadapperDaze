"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const orderStatuses = [
  { value: "PENDING", label: "Pending", bgColor: "bg-amber-100", textColor: "text-amber-800" },
  { value: "PROCESSING", label: "Processing", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  { value: "SHIPPED", label: "Shipped", bgColor: "bg-purple-100", textColor: "text-purple-800" },
  { value: "DELIVERED", label: "Delivered", bgColor: "bg-green-100", textColor: "text-green-800" },
  { value: "CANCELLED", label: "Cancelled", bgColor: "bg-red-100", textColor: "text-red-800" },
]

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [customMessage, setCustomMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const currentStatusOption = orderStatuses.find(s => s.value === status) || orderStatuses[0]

  const handleStatusClick = (newStatus: string) => {
    if (newStatus === status) {
      setOpen(false)
      return
    }

    // If it's a significant status change, prompt for notification options
    if (
      (newStatus === "SHIPPED" || newStatus === "DELIVERED" || newStatus === "CANCELLED") &&
      notifyCustomer
    ) {
      setSelectedStatus(newStatus)
      setDialogOpen(true)
      setOpen(false)
      return
    }

    // Otherwise just update the status directly
    updateOrderStatus(newStatus);
  }

  const updateOrderStatus = async (newStatus: string, message?: string, notify: boolean = notifyCustomer) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          notifyCustomer: notify,
          message: message || undefined
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update order status")
      }

      const data = await response.json()
      setStatus(newStatus)
      
      let toastMessage = `Order status has been updated to ${orderStatuses.find(s => s.value === newStatus)?.label.toLowerCase() || newStatus.toLowerCase()}.`;
      if (notify) {
        toastMessage += " Customer has been notified.";
      }
      
      toast({
        title: "Status updated",
        description: toastMessage,
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setDialogOpen(false)
      setCustomMessage("")
    }
  }

  const handleConfirmStatusChange = () => {
    updateOrderStatus(selectedStatus, customMessage, notifyCustomer);
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full md:w-[200px] justify-between",
              currentStatusOption.bgColor,
              currentStatusOption.textColor,
              "border-0 hover:bg-opacity-80"
            )}
            disabled={isUpdating}
          >
            {isUpdating
              ? "Updating..."
              : currentStatusOption.label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full md:w-[200px] p-0">
          <Command>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {orderStatuses.map((s) => (
                <CommandItem
                  key={s.value}
                  value={s.value}
                  onSelect={() => handleStatusClick(s.value)}
                  className={cn(
                    "flex items-center gap-2",
                    s.value === status && `${s.bgColor} ${s.textColor}`
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    s.value === "PENDING" && "bg-amber-500",
                    s.value === "PROCESSING" && "bg-blue-500",
                    s.value === "SHIPPED" && "bg-purple-500",
                    s.value === "DELIVERED" && "bg-green-500",
                    s.value === "CANCELLED" && "bg-red-500"
                  )} />
                  <span>{s.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      status === s.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change order status to {orderStatuses.find(s => s.value === selectedStatus)?.label || selectedStatus}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="notify-customer" 
                checked={notifyCustomer} 
                onCheckedChange={(checked) => setNotifyCustomer(checked === true)}
              />
              <Label htmlFor="notify-customer" className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> Notify customer
              </Label>
            </div>
            
            {notifyCustomer && (
              <div className="space-y-2">
                <Label htmlFor="custom-message">Add a message to the customer (optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Enter any additional information for the customer..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 