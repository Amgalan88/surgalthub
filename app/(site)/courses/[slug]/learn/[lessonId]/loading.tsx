import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar skeleton */}
        <div className="order-2 space-y-3 lg:order-1">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="order-1 lg:order-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-5 aspect-video w-full rounded-xl" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
