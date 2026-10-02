import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/** Placeholder matching CourseRow while the catalog loads. */
export function CourseRowSkeleton() {
  return (
    <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-8">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
