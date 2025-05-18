import { Metadata } from "next"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"

import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db"

// Dynamic import to prevent font loading issues
const EditProductForm = dynamic(() => import("@/components/admin/edit-product-form"), {
  ssr: true,
})

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details",
}

// Force dynamic rendering for this route
export const dynamicParams = true;
export const revalidate = 0;

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // Await params before accessing its properties
  const { id } = await params;
  
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  let product;
  
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: {
            color: 'asc'
          }
        },
        images: {
          select: {
            id: true,
            color: true,
            order: true,
            // Don't include the actual image data
          },
          orderBy: [
            { color: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <EditProductForm product={product} />
    </div>
  )
} 