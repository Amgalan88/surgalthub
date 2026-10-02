import { Skeleton, CourseRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <CourseRowSkeleton />
        <CourseRowSkeleton />
      </div>
    </div>
  );
}
