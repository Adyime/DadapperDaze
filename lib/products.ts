import { cache } from "react";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { ProcessedProductImage } from "@/types";

import { prisma, getCache, setCache } from "@/lib/db";

// Get all products with optional filtering
export const getProducts = cache(
  async ({
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  }: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const cacheKey = `products:${categoryId || "all"}:${minPrice || 0}:${
      maxPrice || "max"
    }:${sort || "default"}:${page}:${limit}`;

    const cachedProducts = await getCache(cacheKey);
    if (cachedProducts) {
      return cachedProducts;
    }

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        {
          discountedPrice: {
            gte: minPrice,
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
        {
          AND: [
            { discountedPrice: null },
            {
              price: {
                gte: minPrice,
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            },
          ],
        },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sort) {
      case "price-asc":
        orderBy.price = "asc";
        break;
      case "price-desc":
        orderBy.price = "desc";
        break;
      case "name-asc":
        orderBy.name = "asc";
        break;
      case "name-desc":
        orderBy.name = "desc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const skip = (page - 1) * limit;

    // First get the products without applying limit or pagination
    // to get the total count correctly
    const baseProducts = await prisma.product.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountedPrice: true,
        categoryId: true,
        images: {
          orderBy: [{ color: "asc" }, { order: "asc" }],
          select: {
            id: true,
            image: true,
            color: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            stock: true,
          },
        },
      },
    });

    // Get unique color variants for each product
    const variantProducts = baseProducts.flatMap((product) => {
      // Get unique colors from variants
      const uniqueColors = [...new Set(product.variants.map((v) => v.color))];

      return uniqueColors.map((color) => {
        // Get color-specific image or fall back to first image
        const colorImage =
          product.images.find((img) => img.color === color) ||
          product.images[0] ||
          null;

        // Get variants for this specific color
        const colorVariants = product.variants.filter((v) => v.color === color);

        return {
          ...product,
          displayColor: color,
          displayImage: colorImage
            ? {
                ...colorImage,
                // Ensure we don't modify the original image data structure
                image: colorImage.image,
              }
            : null,
          variants: colorVariants,
          // Create a slug for this color variant for navigation
          variantSlug: `${product.slug}?color=${encodeURIComponent(color)}`,
        };
      });
    });

    // Sort and paginate the variant products
    const sortedVariants = sortVariantProducts(variantProducts, sort);
    const total = sortedVariants.length;
    const paginatedVariants = sortedVariants.slice(skip, skip + limit);

    const result = {
      products: paginatedVariants,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    await setCache(cacheKey, result, 60 * 5); // Cache for 5 minutes

    return result;
  }
);

// Helper function to sort variant products
function sortVariantProducts(products: any[], sortOption: string | undefined) {
  switch (sortOption) {
    case "price-asc":
      return [...products].sort((a, b) => {
        const priceA = a.discountedPrice ?? a.price;
        const priceB = b.discountedPrice ?? b.price;
        return priceA - priceB;
      });
    case "price-desc":
      return [...products].sort((a, b) => {
        const priceA = a.discountedPrice ?? a.price;
        const priceB = b.discountedPrice ?? b.price;
        return priceB - priceA;
      });
    case "name-asc":
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return [...products].sort((a, b) => b.name.localeCompare(a.name));
    default:
      return products;
  }
}

// Get featured products
export const getFeaturedProducts = cache(async (limit = 8) => {
  const cacheKey = `products:featured:${limit}`;

  const cachedProducts = await getCache(cacheKey);
  if (cachedProducts) {
    console.log("Returning cached featured products");
    return cachedProducts;
  }

  console.log("Fetching fresh featured products");
  const products = await prisma.product.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      discountedPrice: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          color: true,
          size: true,
          stock: true,
        },
        orderBy: {
          color: "asc",
        },
      },
      images: {
        select: {
          id: true,
          image: true,
          color: true,
          order: true,
        },
        orderBy: [{ color: "asc" }, { order: "asc" }],
      },
    },
  });

  console.log(`Found ${products.length} featured products`);

  // Process products to group variants by color and match images
  const processedProducts = products.map((product) => {
    console.log(`Processing product: ${product.name}`);
    console.log(`Images count: ${product.images.length}`);

    // Get unique colors from variants
    const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
    console.log(`Unique colors: ${uniqueColors.join(", ")}`);

    // Group variants by color
    const variantsByColor = product.variants.reduce((acc, variant) => {
      if (!acc[variant.color]) {
        acc[variant.color] = [];
      }
      acc[variant.color].push(variant);
      return acc;
    }, {} as Record<string, typeof product.variants>);

    // Process and match images with colors
    const processedImages = uniqueColors.map((color) => {
      // Find image for this color, or fall back to first image
      const colorImage =
        product.images.find((img) => img.color === color) || product.images[0];
      console.log(`Processing color ${color}, found image: ${colorImage?.id}`);

      let processedImage: ProcessedProductImage = {
        id: colorImage?.id || "",
        color: colorImage?.color || null,
        order: colorImage?.order || 0,
        image: "/placeholder.jpg",
      };

      if (colorImage && colorImage.image) {
        try {
          let base64Data: string | undefined;

          // Check if image is already a string (might be a data URL)
          if (typeof colorImage.image === "string") {
            console.log(`Image is string`);
            if ((colorImage.image as string).startsWith("data:")) {
              base64Data = colorImage.image;
            } else {
              base64Data = `data:image/jpeg;base64,${colorImage.image}`;
            }
          } else if (Buffer.isBuffer(colorImage.image)) {
            console.log(`Image is Buffer`);
            // Convert image buffer to base64 string
            base64Data = `data:image/jpeg;base64,${Buffer.from(
              colorImage.image
            ).toString("base64")}`;
          } else if (colorImage.image instanceof Uint8Array) {
            console.log(`Image is Uint8Array`);
            base64Data = `data:image/jpeg;base64,${Buffer.from(
              colorImage.image
            ).toString("base64")}`;
          }

          if (base64Data) {
            processedImage.image = base64Data;
            console.log(`Successfully processed image to base64`);
          } else {
            console.log(
              `Could not process image data:`,
              typeof colorImage.image
            );
            processedImage.image = "/placeholder.jpg";
          }
        } catch (error) {
          console.error(`Error processing image ${colorImage.id}:`, error);
          processedImage.image = "/placeholder.jpg";
        }
      } else {
        console.log(`No image data for color ${color}`);
      }

      return {
        color,
        image: processedImage,
        variants: variantsByColor[color] || [],
      };
    });

    const result = {
      ...product,
      colorOptions: processedImages,
    };

    console.log(`Processed product ${product.name}:`, {
      id: result.id,
      name: result.name,
      colorsCount: result.colorOptions.length,
      hasImages: result.colorOptions.some(
        (co) => co.image?.image !== "/placeholder.jpg"
      ),
    });

    return result;
  });

  await setCache(cacheKey, processedProducts, 60 * 10); // Cache for 10 minutes

  return processedProducts;
});

// Get product by slug
export const getProductBySlug = cache(async (slug: string) => {
  const cacheKey = `product:${slug}`;

  const cachedProduct = await getCache(cacheKey);
  if (cachedProduct) {
    return cachedProduct;
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      discountedPrice: true,
      categoryId: true,
      images: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          image: true,
          color: true,
        },
      },
      category: true,
      variants: true,
    },
  });

  if (product) {
    await setCache(cacheKey, product, 60 * 10); // Cache for 10 minutes
  }

  return product;
});

// Get related products
export const getRelatedProducts = cache(
  async (productId: string, categoryId: string, limit = 4) => {
    const cacheKey = `products:related:${productId}:${limit}`;

    const cachedProducts = await getCache(cacheKey);
    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountedPrice: true,
        categoryId: true,
        images: {
          take: 1,
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            image: true,
            color: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    await setCache(cacheKey, products, 60 * 10); // Cache for 10 minutes

    return products;
  }
);

// Compress image
export async function compressImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Get all products without flattening by variant colors
export const getSimpleProducts = cache(
  async ({
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  }: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const cacheKey = `simple-products:${categoryId || "all"}:${minPrice || 0}:${
      maxPrice || "max"
    }:${sort || "default"}:${page}:${limit}`;

    const cachedProducts = await getCache(cacheKey);
    if (cachedProducts) {
      return cachedProducts;
    }

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        {
          discountedPrice: {
            gte: minPrice,
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
        {
          AND: [
            { discountedPrice: null },
            {
              price: {
                gte: minPrice,
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            },
          ],
        },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sort) {
      case "price-asc":
        orderBy.price = "asc";
        break;
      case "price-desc":
        orderBy.price = "desc";
        break;
      case "name-asc":
        orderBy.name = "asc";
        break;
      case "name-desc":
        orderBy.name = "desc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountedPrice: true,
        categoryId: true,
        images: {
          orderBy: [{ color: "asc" }, { order: "asc" }],
          select: {
            id: true,
            image: true,
            color: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            stock: true,
          },
        },
      },
    });

    // Process each product's images to convert Bytes to base64 strings
    const processedProducts = products.map((product) => {
      console.log(
        `Processing product: ${product.name}, Image count: ${product.images.length}`
      );

      // Process each image to convert Buffer to base64 string
      const processedImages = product.images.map((img) => {
        if (!img.image) {
          console.log(`Image ${img.id} has no image data`);
          return img;
        }

        try {
          console.log(
            `Processing image ${img.id}, type: ${typeof img.image}, color: ${
              img.color || "none"
            }`
          );

          // Check if image is already a string (might be a data URL)
          if (typeof img.image === "string") {
            console.log(
              `Image is already a string, length: ${
                (img.image as string).length
              }`
            );
            if ((img.image as string).startsWith("data:")) {
              return img; // Already a data URL
            }
            return {
              ...img,
              image: `data:image/jpeg;base64,${img.image}`,
            };
          }

          // Convert image buffer to base64 string
          const base64Image = Buffer.from(img.image).toString("base64");
          console.log(`Converted to base64, length: ${base64Image.length}`);

          return {
            ...img,
            image: `data:image/jpeg;base64,${base64Image}`,
          };
        } catch (error) {
          console.error(`Error processing image ${img.id}:`, error);
          return {
            ...img,
            image: null, // Set to null so we can handle it gracefully in the UI
          };
        }
      });

      return {
        ...product,
        images: processedImages,
      };
    });

    const result = {
      products: processedProducts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    await setCache(cacheKey, result, 60 * 5); // Cache for 5 minutes

    return result;
  }
);
