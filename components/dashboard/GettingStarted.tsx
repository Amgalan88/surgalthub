import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StartStep {
  label: string;
  done: boolean;
  /** Shown instead of a tick while something is in progress, e.g. a payment being checked. */
  note?: string;
  href?: string;
}

/** A short "getting started" checklist that disappears once everything is ticked. */
export function GettingStarted({ steps }: { steps: StartStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-navy-900">Эхлэх зам</h2>
        <span className="text-sm tabular-nums text-slate-500">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 space-y-1">
        {steps.map((step, i) => {
          const content = (
            <>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {step.done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("flex-1", step.done ? "text-slate-400 line-through" : "text-navy-900")}>
                {step.label}
              </span>
              {!step.done && step.note && (
                <span className="text-xs text-gold-700">{step.note}</span>
              )}
            </>
          );
          return (
            <li key={step.label}>
              {step.href && !step.done ? (
                <Link
                  href={step.href}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  {content}
                </Link>
              ) : (
                <div className="-mx-2 flex items-center gap-3 px-2 py-2 text-sm">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
