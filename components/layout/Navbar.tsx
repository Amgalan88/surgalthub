import Link from "next/link";
import type { Profile } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";
import { LinkButton } from "@/components/ui/Button";
import { LogoWordmark } from "./Logo";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/courses", label: "Сургалтууд" },
  { href: "/premium", label: "Үнэ" },
  { href: "/#faq", label: "Түгээмэл асуулт" },
];

export default function Navbar({
  profile,
  pendingPayments = 0,
}: {
  profile: Profile | null;
  /** Admins only: learners waiting for their payment to be approved. */
  pendingPayments?: number;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Cargo Hub нүүр" className="shrink-0">
          <LogoWordmark size="sm" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                >
                  Админ
                  {pendingPayments > 0 && (
                    <span
                      title={`${pendingPayments} төлбөр баталгаажуулалт хүлээж байна`}
                      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white"
                    >
                      {pendingPayments}
                    </span>
                  )}
                </Link>
              )}
              <LinkButton href="/dashboard" size="sm" variant="secondary">
                Миний сургалт
              </LinkButton>
              <span
                title={profile.full_name ?? "Хэрэглэгч"}
                className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200"
              >
                {(profile.full_name?.trim()?.[0] ?? "Х").toUpperCase()}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="cursor-pointer rounded-md px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-navy-900"
                >
                  Гарах
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-navy-900"
              >
                Нэвтрэх
              </Link>
              <LinkButton href="/register" size="sm">
                Бүртгүүлэх
              </LinkButton>
            </>
          )}
        </div>

        <MobileMenu
          profile={profile}
          navLinks={navLinks}
          pendingPayments={pendingPayments}
        />
      </div>
    </header>
  );
}
