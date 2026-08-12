"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { StatusMessage } from "@/components/layout/StatusMessage";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  return (
    <StatusMessage
      icon={TriangleAlert}
      tone="red"
      title="Алдаа гарлаа"
      description="Админ хуудсыг ачаалахад асуудал гарлаа. Дахин оролдоод үзнэ үү."
    >
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Дахин оролдох
      </button>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        Хяналтын самбар
      </Link>
    </StatusMessage>
  );
}
