"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Profile } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";

export default function MobileMenu({
  profile,
  navLinks,
  pendingPayments = 0,
}: {
  profile: Profile | null;
  navLinks: { href: string; label: string }[];
  pendingPayments?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close after any navigation, including the browser back button.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex items-center gap-2 md:hidden">
      {profile && (
        <span
          aria-label={`Нэвтэрсэн: ${profile.full_name ?? "Хэрэглэгч"}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200"
        >
          {(profile.full_name?.trim()?.[0] ?? "Х").toUpperCase()}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Цэс хаах" : "Цэс нээх"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-navy-900"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 z-50 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg shadow-navy-900/5"
        >
          <nav className="flex flex-col gap-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] text-navy-900 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
            {profile ? (
              <>
                <p className="px-3 pb-1 text-xs text-slate-500">
                  Нэвтэрсэн: <span className="font-medium text-navy-900">{profile.full_name ?? "Хэрэглэгч"}</span>
                </p>
                {profile.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-navy-900"
                  >
                    Админ
                    {pendingPayments > 0 && (
                      <span className="ml-2 rounded-full bg-gold-400 px-1.5 py-0.5 text-xs font-semibold text-navy-950">
                        {pendingPayments} төлбөр
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Миний сургалт
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-500 hover:text-navy-900"
                  >
                    Гарах
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-navy-900"
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
