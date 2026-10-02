import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 sm:px-6 md:py-16">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </section>
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-10 sm:px-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
