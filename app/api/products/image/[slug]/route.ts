import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

// GET - Serve product image
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: {
        images: {
          take: 1,
          orderBy: {
            order: 'asc'
          },
          select: {
            image: true,
          },
        },
      },
    })

    if (!product || !product.images[0]) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Return the image as a response
    return new NextResponse(product.images[0].image, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving product image:", error)
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 })
  }
}
