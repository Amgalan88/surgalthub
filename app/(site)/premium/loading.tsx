import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="bg-navy-950">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-14 sm:px-6">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
