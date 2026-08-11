import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-5 w-40" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
