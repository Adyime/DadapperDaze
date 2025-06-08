import { PrismaClient } from "@prisma/client";

// Ensure only one instance is created across hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Memory cache implementation
const memoryCache = new Map<string, { data: string; expiry?: number }>();

// Cache helper functions
export async function getCache(key: string) {
  try {
    // Memory cache implementation
    const item = memoryCache.get(key);
    if (item) {
      if (item.expiry && item.expiry < Date.now()) {
        memoryCache.delete(key);
        return null;
      }
      return JSON.parse(item.data);
    }
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function setCache(
  key: string,
  data: any,
  expireInSeconds?: number
) {
  try {
    const stringData = JSON.stringify(data);

    // Set in memory cache
    memoryCache.set(key, {
      data: stringData,
      expiry: expireInSeconds ? Date.now() + expireInSeconds * 1000 : undefined,
    });
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    // Clean memory cache
    memoryCache.delete(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function invalidateCachePattern(pattern: string) {
  try {
    // For memory cache, do a simple pattern match
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace("*", ""))) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error("Cache invalidate error:", error);
  }
}
