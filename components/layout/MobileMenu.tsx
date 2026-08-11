"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Цэс"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg">
          <nav className="flex flex-col gap-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            {profile ? (
              <>
                {profile.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium"
                  >
                    Админ
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium"
                >
                  Хяналтын самбар
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-600"
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
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium"
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
