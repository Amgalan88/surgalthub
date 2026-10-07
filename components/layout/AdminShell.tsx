"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircleQuestion,
  ExternalLink,
  Menu,
  Ticket,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { Logo } from "./Logo";

const links = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard, exact: true },
  { href: "/admin/payments", label: "Төлбөрүүд", icon: Banknote, exact: false },
  { href: "/admin/promo", label: "Промо код", icon: Ticket, exact: false },
  { href: "/admin/courses", label: "Сургалтууд", icon: BookOpen, exact: false },
  { href: "/admin/import", label: "Хичээл оруулах", icon: Upload, exact: false },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users, exact: false },
  {
    href: "/admin/questions",
    label: "Асуултууд",
    icon: MessageCircleQuestion,
    exact: false,
  },
];

function SidebarContent({
  onNavigate,
  pendingPayments,
}: {
  onNavigate?: () => void;
  pendingPayments: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Logo size="sm" />
        <span className="text-sm font-semibold text-white/80">Админ</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon size={17} />
              <span className="flex-1">{link.label}</span>
              {link.href === "/admin/payments" && pendingPayments > 0 && (
                <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-navy-950">
                  {pendingPayments}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={17} /> Сайт руу буцах
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Гарах
          </button>
        </form>
      </div>
    </>
  );
}

export default function AdminShell({
  children,
  pendingPayments = 0,
}: {
  children: React.ReactNode;
  pendingPayments?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 flex-col border-r border-slate-200 bg-navy-900 text-white lg:flex lg:w-64">
        <SidebarContent pendingPayments={pendingPayments} />
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-navy-900 px-4 text-white lg:hidden">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Цэс нээх"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <Menu size={20} />
          {pendingPayments > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-gold-400" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-xl">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Цэс хаах"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} pendingPayments={pendingPayments} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
