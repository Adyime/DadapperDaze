import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import AdminUsersList from "@/components/admin/admin-users-list"

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ""
  const page = Number(searchParams.page) || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <div className="flex items-center gap-4">
        <form className="flex-1 max-w-sm">
          <div className="relative">
            <Input placeholder="Search users..." name="q" defaultValue={query} className="pr-10" />
            <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
              Search
            </Button>
          </div>
        </form>
      </div>

      <Suspense key={`users-${query}-${page}`} fallback={<UsersListSkeleton />}>
        <AdminUsersList query={query} page={page} />
      </Suspense>
    </div>
  )
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-4 p-4 bg-muted/50">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>

        <div className="divide-y">
          {Array(10)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="grid grid-cols-4 p-4">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  )
}
