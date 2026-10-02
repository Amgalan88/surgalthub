import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared shell for the 404 and error screens. Purely presentational so it can
 * render from both server (not-found) and client (error boundary) contexts.
 */
export function StatusMessage({
  code,
  title,
  description,
  icon: Icon,
  tone = "brand",
  className,
  children,
}: {
  code?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: "brand" | "red";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28",
        className
      )}
    >
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-xl ring-1 ring-inset",
          tone === "red"
            ? "bg-red-50 text-red-600 ring-red-600/20"
            : "bg-brand-50 text-brand-600 ring-brand-600/20"
        )}
      >
        <Icon size={30} strokeWidth={1.75} />
      </span>

      {code && (
        <p className="mt-6 text-sm font-semibold tracking-wide text-slate-400">
          {code}
        </p>
      )}

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 leading-relaxed text-slate-500">{description}</p>

      {children && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
      )}
    </div>
  );
}
