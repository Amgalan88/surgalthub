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
}: {
  profile: Profile | null;
  navLinks: { href: string; label: string }[];
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
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
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 z-50 border-b border-white/10 bg-navy-950 px-4 pb-4 shadow-xl"
        >
          <nav className="flex flex-col gap-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
            {profile ? (
              <>
                <p className="px-3 pb-1 text-xs text-slate-400">
                  Нэвтэрсэн: <span className="text-slate-200">{profile.full_name ?? "Хэрэглэгч"}</span>
                </p>
                {profile.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/25 px-3 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Админ
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Хяналтын самбар
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-300 hover:text-white"
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
                  className="rounded-lg border border-white/25 px-3 py-2.5 text-center text-sm font-medium text-white"
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
