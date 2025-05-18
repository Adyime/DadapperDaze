import { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import NewProductForm from "@/components/admin/new-product-form"

export const metadata: Metadata = {
  title: "New Product",
  description: "Create a new product",
}

export default async function NewProductPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">New Product</h1>
      <NewProductForm />
    </div>
  )
} 