import { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import NewCategoryForm from "@/components/admin/new-category-form"

export const metadata: Metadata = {
  title: "New Category",
  description: "Create a new category",
}

export default async function NewCategoryPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">New Category</h1>
      <NewCategoryForm />
    </div>
  )
} 