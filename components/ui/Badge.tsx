import { cn } from "@/lib/utils";

type Tone = "brand" | "navy" | "green" | "red" | "slate";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/20",
  navy: "bg-navy-50 text-navy-700 ring-navy-700/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
