import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Serve product image by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching image with ID: ${params.id}`)
    
    // Find the image by ID
    const productImage = await prisma.productImage.findUnique({
      where: { id: params.id },
      select: { image: true }
    })

    if (!productImage) {
      console.log(`Image not found: ${params.id}`)
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }
    
    if (!productImage.image) {
      console.log(`Image exists but has no data: ${params.id}`)
      return NextResponse.json({ error: "Image data missing" }, { status: 404 })
    }

    console.log(`Successfully fetched image: ${params.id}, size: ${Buffer.byteLength(productImage.image)} bytes`)
    
    // Return the image as a response
    return new NextResponse(productImage.image, {
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