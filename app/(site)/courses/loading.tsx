import { Skeleton, CourseRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="mt-10 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CourseRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
