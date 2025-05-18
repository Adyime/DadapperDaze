"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const couponFormSchema = z
  .object({
    code: z.string().min(1, "Code is required").toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderValue: z.number().positive("Minimum order value must be positive").optional(),
    maxDiscount: z.number().positive("Maximum discount must be positive").optional(),
    startDate: z.string(),
    endDate: z.string(),
    usageLimit: z.number().int().positive("Usage limit must be a positive integer").optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENTAGE") {
        return data.discountValue <= 100
      }
      return true
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    },
  )

type CouponFormValues = z.infer<typeof couponFormSchema>

interface CouponFormProps {
  initialData?: Partial<CouponFormValues> & { id?: string }
}

export default function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const defaultValues: CouponFormValues = {
    code: initialData?.code || "",
    description: initialData?.description || "",
    discountType: initialData?.discountType || "PERCENTAGE",
    discountValue: initialData?.discountValue || 0,
    minOrderValue: initialData?.minOrderValue,
    maxDiscount: initialData?.maxDiscount,
    startDate: initialData?.startDate
      ? format(new Date(initialData.startDate), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: initialData?.endDate
      ? format(new Date(initialData.endDate), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    usageLimit: initialData?.usageLimit,
    isActive: initialData?.isActive ?? true,
  }

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
  })

  async function onSubmit(data: CouponFormValues) {
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }

      const response = await fetch(
        initialData?.id ? `/api/coupons/${initialData.id}` : "/api/coupons",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: initialData?.id ? "Coupon updated" : "Coupon created",
        description: `Successfully ${initialData?.id ? "updated" : "created"} coupon ${data.code}`,
      })

      router.push("/admin/coupons")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="SUMMER2024" />
              </FormControl>
              <FormDescription>
                The code customers will enter to apply this coupon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Summer sale discount" />
              </FormControl>
              <FormDescription>
                Optional description for internal reference.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="PERCENTAGE" />
                    </FormControl>
                    <FormLabel className="font-normal">Percentage</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="FIXED" />
                    </FormControl>
                    <FormLabel className="font-normal">Fixed Amount</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {form.watch("discountType") === "PERCENTAGE"
                  ? "Percentage off (1-100)"
                  : "Fixed amount off in dollars"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minOrderValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>
                Optional minimum order value required to use this coupon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxDiscount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Discount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>
                Optional maximum discount amount (useful for percentage discounts).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Limit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>
                Optional maximum number of times this coupon can be used.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Coupon can only be used when active and within its date range.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData?.id ? "Update Coupon" : "Create Coupon"}
        </Button>
      </form>
    </Form>
  )
} 