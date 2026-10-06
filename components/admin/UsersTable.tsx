"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { activatePremiumAccess, revokePremiumAccess } from "@/lib/actions/admin/users";
import { isPremiumActive, PREMIUM_DURATION_MONTHS } from "@/lib/access";
import type { UserWithEmail } from "@/lib/data/admin";

/** YYYY.MM.DD, built by hand: locale formatting differs between server and browser. */
function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function PlanBadge({ user }: { user: UserWithEmail }) {
  if (user.role === "admin") {
    return <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-medium text-white">Админ</span>;
  }
  if (isPremiumActive(user)) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        Premium · {formatDate(user.premium_until)} хүртэл
      </span>
    );
  }
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Үнэгүй</span>;
}

/** Rarely needed manual overrides, kept out of the way behind "⋯". */
function RowMenu({ user }: { user: UserWithEmail }) {
  if (user.role === "admin") return null;
  const active = isPremiumActive(user);

  return (
    <details className="relative">
      <summary
        aria-label="Бусад үйлдэл"
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
      >
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-lg">
        {active ? (
          <form action={revokePremiumAccess.bind(null, user.id)}>
            <ConfirmSubmitButton
              confirmMessage={`${user.full_name ?? "Энэ хэрэглэгч"}-ийн Premium эрхийг цуцлах уу? Үзээгүй Premium хичээлүүд нь хаагдана.`}
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Premium цуцлах
            </ConfirmSubmitButton>
          </form>
        ) : (
          <form action={activatePremiumAccess.bind(null, user.id)}>
            <ConfirmSubmitButton
              confirmMessage={`Төлбөрийг шалгасан уу? ${user.full_name ?? "Энэ хэрэглэгч"}-д ${PREMIUM_DURATION_MONTHS} сарын Premium гараар нээх үү?`}
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-navy-900 hover:bg-slate-50"
            >
              Premium гараар нээх ({PREMIUM_DURATION_MONTHS} сар)
            </ConfirmSubmitButton>
          </form>
        )}
      </div>
    </details>
  );
}

export function UsersTable({ users }: { users: UserWithEmail[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.phone].some((field) => field?.toLowerCase().includes(q))
    );
  }, [users, query]);

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          type="search"
          aria-label="Хэрэглэгч хайх"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Нэр, имэйл, утсаар хайх..."
          className="pl-9"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Хэрэглэгч</th>
              <th className="px-5 py-3 font-medium">Утас</th>
              <th className="px-5 py-3 font-medium">Бүртгүүлсэн</th>
              <th className="px-5 py-3 font-medium">Сүүлд орсон</th>
              <th className="px-5 py-3 font-medium">Эрх</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar profile={u} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-900">{u.full_name ?? "Нэргүй"}</p>
                      <p className="truncate text-xs text-slate-500">{u.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-slate-600">{u.phone ?? "—"}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(u.lastSignInAt)}</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <PlanBadge user={u} />
                </td>
                <td className="px-3 py-3">
                  <RowMenu user={u} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  Тохирох хэрэглэгч олдсонгүй.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
