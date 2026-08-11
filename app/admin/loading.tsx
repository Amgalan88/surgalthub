import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-6 sm:p-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-5 w-72" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
