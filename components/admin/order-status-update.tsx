"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"

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

const orderStatuses = [
  { value: "PENDING", label: "Pending", bgColor: "bg-amber-100", textColor: "text-amber-800" },
  { value: "PROCESSING", label: "Processing", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  { value: "SHIPPED", label: "Shipped", bgColor: "bg-purple-100", textColor: "text-purple-800" },
  { value: "DELIVERED", label: "Delivered", bgColor: "bg-green-100", textColor: "text-green-800" },
  { value: "CANCELLED", label: "Cancelled", bgColor: "bg-red-100", textColor: "text-red-800" },
]

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const currentStatusOption = orderStatuses.find(s => s.value === status) || orderStatuses[0]

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setOpen(false)
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update order status")
      }

      setStatus(newStatus)
      toast({
        title: "Status updated",
        description: `Order status has been updated to ${orderStatuses.find(s => s.value === newStatus)?.label.toLowerCase() || newStatus.toLowerCase()}.`,
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
      setOpen(false)
    }
  }

  return (
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
                onSelect={() => handleStatusChange(s.value)}
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
  )
} 