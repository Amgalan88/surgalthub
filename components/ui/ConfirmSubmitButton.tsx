"use client";

import { cn } from "@/lib/utils";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string }) {
  return (
    <button
      type="submit"
      className={cn(className)}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
