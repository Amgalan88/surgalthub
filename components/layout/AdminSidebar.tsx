"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Сургалтууд", icon: BookOpen, exact: false },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-navy-900 text-white">
      <div className="flex h-16 items-center gap-2 px-5 font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Package size={16} />
        </span>
        Админ самбар
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
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
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
    </aside>
  );
}
