import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nextcommerce.vercel.app"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout/", "/cart/", "/profile/", "/orders/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
