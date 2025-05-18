import { cache } from "react"

import { prisma, getCache, setCache } from "@/lib/db"

// Get dashboard stats
export const getDashboardStats = cache(async () => {
  const cacheKey = "admin:dashboard:stats"

  const cachedStats = await getCache(cacheKey)
  if (cachedStats) {
    return cachedStats
  }

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalRevenue,
    lastMonthRevenue,
    totalOrders,
    lastMonthOrders,
    totalUsers,
    lastMonthUsers,
    totalProducts,
    lastMonthProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    }),
    prisma.product.count(),
    prisma.product.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    }),
  ])

  const currentMonthOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  const currentMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  const currentMonthProducts = await prisma.product.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  const currentMonthRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  const stats = {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalUsers,
    totalProducts,
    revenueChange: calculatePercentageChange(lastMonthRevenue._sum.total || 0, currentMonthRevenue._sum.total || 0),
    ordersChange: calculatePercentageChange(lastMonthOrders, currentMonthOrders),
    usersChange: calculatePercentageChange(lastMonthUsers, currentMonthUsers),
    productsChange: calculatePercentageChange(lastMonthProducts, currentMonthProducts),
  }

  await setCache(cacheKey, stats, 60 * 15) // Cache for 15 minutes

  return stats
})

// Get top products
export const getTopProducts = cache(async (limit = 5) => {
  const cacheKey = `admin:top-products:${limit}`

  const cachedProducts = await getCache(cacheKey)
  if (cachedProducts) {
    return cachedProducts
  }

  const products = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  })

  const productIds = products.map((p) => p.productId)

  const productDetails = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
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
          order: 'asc'
        },
        select: {
          id: true,
          image: true,
        },
      },
    },
  })

  const topProducts = products.map((p) => {
    const product = productDetails.find((pd) => pd.id === p.productId)
    return {
      ...product,
      totalSold: p._sum.quantity,
    }
  })

  await setCache(cacheKey, topProducts, 60 * 30) // Cache for 30 minutes

  return topProducts
})

// Get monthly sales data
export const getMonthlySalesData = cache(async () => {
  const cacheKey = "admin:monthly-sales"

  const cachedData = await getCache(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
  })

  const monthlyData: Record<string, { month: string; total: number }> = {}

  // Initialize all months
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
    monthlyData[monthYear] = { month: monthYear, total: 0 }
  }

  // Fill in the data
  orders.forEach((order) => {
    const date = new Date(order.createdAt)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (monthlyData[monthYear]) {
      monthlyData[monthYear].total += order.total
    }
  })

  const result = Object.values(monthlyData).reverse()

  await setCache(cacheKey, result, 60 * 60) // Cache for 1 hour

  return result
})

// Helper function to calculate percentage change
function calculatePercentageChange(previous: number, current: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
