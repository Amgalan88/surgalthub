import { Skeleton, CourseCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="bg-navy-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl space-y-5">
            <Skeleton className="h-24 w-52 rounded-md bg-white/10" />
            <Skeleton className="h-6 w-64 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-full max-w-lg bg-white/10" />
            <Skeleton className="h-5 w-full max-w-md bg-white/10" />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-12 w-40 rounded-xl bg-white/10" />
              <Skeleton className="h-12 w-44 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Skeleton className="mx-auto h-9 w-64" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      </section>
    </div>
  );
}
