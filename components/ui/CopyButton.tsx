"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Copies a value (e.g. a bank account number) so it is never mistyped. */
export function CopyButton({
  value,
  label = "Хуулах",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (old browser / insecure context): the value stays
      // visible on screen, so there is nothing else to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Хуулагдлаа" : label}
      title={copied ? "Хуулагдлаа" : label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        className
      )}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
}
