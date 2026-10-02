import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Skeleton className="h-4 w-40" />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-xl" />
              <Skeleton className="h-5 w-full max-w-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-4 h-12 w-48 rounded-lg" />
            </div>
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <Skeleton className="h-7 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
