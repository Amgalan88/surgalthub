"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { StatusMessage } from "@/components/layout/StatusMessage";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site error boundary caught:", error);
  }, [error]);

  return (
    <StatusMessage
      icon={TriangleAlert}
      tone="red"
      title="Алдаа гарлаа"
      description="Уучлаарай, хуудсыг ачаалахад асуудал гарлаа. Дахин оролдоод үзнэ үү — давтагдвал админд мэдэгдээрэй."
    >
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Дахин оролдох
      </button>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        Нүүр хуудас
      </Link>
    </StatusMessage>
  );
}
