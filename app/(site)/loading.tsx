import { Skeleton, CourseRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full max-w-md" />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-12 w-44 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <CourseRowSkeleton />
        <CourseRowSkeleton />
      </section>
    </div>
  );
}
