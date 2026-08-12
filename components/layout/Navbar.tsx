import Link from "next/link";
import type { Profile } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";
import { Button, LinkButton } from "@/components/ui/Button";
import { LogoWordmark } from "./Logo";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/courses", label: "Сургалтууд" },
  { href: "/#tracks", label: "Чиглэлүүд" },
  { href: "/#advantages", label: "Давуу тал" },
];

export default function Navbar({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Cargo Hub нүүр">
          <LogoWordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {(profile.full_name?.trim()?.[0] ?? "Х").toUpperCase()}
                </span>
                <span className="hidden max-w-[9rem] truncate lg:inline">
                  {profile.full_name ?? "Хэрэглэгч"}
                </span>
              </span>
              {profile.role === "admin" && (
                <LinkButton
                  href="/admin"
                  variant="outline"
                  size="sm"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  Админ
                </LinkButton>
              )}
              <LinkButton href="/dashboard" size="sm">
                Хяналтын самбар
              </LinkButton>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Гарах
                </Button>
              </form>
            </>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Нэвтрэх
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Бүртгүүлэх
              </LinkButton>
            </>
          )}
        </div>

        <MobileMenu profile={profile} navLinks={navLinks} />
      </div>
    </header>
  );
}
