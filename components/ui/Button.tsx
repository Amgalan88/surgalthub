import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary:
    "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900",
  outline:
    "border border-slate-300 text-navy-900 bg-white hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-slate-400",
  ghost:
    "text-slate-700 hover:bg-slate-100 active:scale-[0.98] focus-visible:outline-slate-400",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] focus-visible:outline-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-[15px] px-5 py-3 rounded-lg gap-2",
};

const base =
  "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none outline-offset-2 focus-visible:outline-2 cursor-pointer";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps &
  React.ComponentProps<typeof Link>;

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
