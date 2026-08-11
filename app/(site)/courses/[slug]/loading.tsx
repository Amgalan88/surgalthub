import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      {/* Course header skeleton */}
      <section className="bg-navy-950">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
            <Skeleton className="h-4 w-28 bg-white/10" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-7 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
          <div>
            <div className="rounded-2xl border border-slate-200 p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-5 h-11 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
