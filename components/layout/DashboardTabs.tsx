"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Миний сургалт" },
  { href: "/dashboard/profile", label: "Профайл" },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-4 text-sm font-medium",
              active
                ? "border-brand-600 font-medium text-navy-900"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-navy-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
