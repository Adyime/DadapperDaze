import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      <div className="aspect-square overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-1 h-4 w-1/2" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
} 