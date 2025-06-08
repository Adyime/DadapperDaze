import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountedPrice: true,
        images: {
          take: 1,
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
          },
        },
      },
      take: 5,
      orderBy: {
        name: "asc",
      },
    });

    const processedProducts = products.map((product) => ({
      ...product,
      imageUrl: product.images[0]
        ? `/api/product-images/${product.images[0].id}`
        : null,
    }));

    return NextResponse.json({ products: processedProducts });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
