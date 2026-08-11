import Link from "next/link";
import { Package } from "lucide-react";
import type { Profile } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";
import { Button, LinkButton } from "@/components/ui/Button";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/courses", label: "Сургалтууд" },
  { href: "/#tracks", label: "Чиглэлүүд" },
  { href: "/#advantages", label: "Давуу тал" },
];

export default function Navbar({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-navy-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Package size={18} />
          </span>
          <span className="text-lg tracking-tight">Карго Академи</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <LinkButton href="/admin" variant="outline" size="sm">
                  Админ
                </LinkButton>
              )}
              <LinkButton href="/dashboard" variant="outline" size="sm">
                Хяналтын самбар
              </LinkButton>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Гарах
                </Button>
              </form>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Нэвтрэх
              </LinkButton>
              <LinkButton href="/register" variant="primary" size="sm">
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
