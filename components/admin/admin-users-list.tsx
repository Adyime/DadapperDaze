import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { prisma } from "@/lib/db"

interface AdminUsersListProps {
  query: string
  page: number
}

export default async function AdminUsersList({ query, page }: AdminUsersListProps) {
  const limit = 10
  const skip = (page - 1) * limit

  const where = query
    ? {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-4 p-4 bg-muted/50">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-4 p-4 items-center">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image || "/placeholder.svg"}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</span>
                  </div>
                )}
                <span className="font-medium truncate">{user.name || "No name"}</span>
              </div>
              <div className="truncate">{user.email}</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/users/${user.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}

          {users.length === 0 && <div className="p-4 text-center text-muted-foreground">No users found.</div>}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/admin/users?page=${page - 1}${query ? `&q=${query}` : ""}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/admin/users?page=${i + 1}${query ? `&q=${query}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`/admin/users?page=${page + 1}${query ? `&q=${query}` : ""}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
