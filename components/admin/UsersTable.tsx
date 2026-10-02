"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, KeyRound, Copy, Check, X, Crown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  generateUserPassword,
  activatePremiumAccess,
  revokePremiumAccess,
} from "@/lib/actions/admin/users";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { isPremiumActive, PREMIUM_DURATION_MONTHS } from "@/lib/access";
import type { UserWithEmail } from "@/lib/data/admin";

function GeneratePasswordCell({ userId }: { userId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateUserPassword(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setPassword(result.password ?? null);
        setCopied(false);
      }
    });
  }

  if (password) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <code className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          {password}
        </code>
        <button
          type="button"
          title="Хуулах"
          onClick={() => {
            navigator.clipboard.writeText(password);
            setCopied(true);
          }}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
        <button
          type="button"
          title="Хаах"
          onClick={() => setPassword(null)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <KeyRound size={13} />
        {pending ? "Үүсгэж байна..." : "Нууц үг үүсгэх"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PremiumCell({
  userId,
  premiumUntil,
  active,
  isAdmin,
}: {
  userId: string;
  premiumUntil: string | null;
  active: boolean;
  isAdmin: boolean;
}) {
  const activateAction = activatePremiumAccess.bind(null, userId);
  const revokeAction = revokePremiumAccess.bind(null, userId);

  if (isAdmin) {
    return (
      <div className="flex justify-end">
        <Badge tone="brand">Хугацаагүй (админ)</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {active && (
        <Badge tone="green">
          {new Date(premiumUntil!).toLocaleDateString("mn-MN")} хүртэл
        </Badge>
      )}
      <div className="flex items-center gap-2">
        <form action={activateAction}>
          <ConfirmSubmitButton
            confirmMessage={
              active
                ? `Premium эрхийг одоогийн дуусах хугацаан дээр нэмж ${PREMIUM_DURATION_MONTHS} сараар сунгах уу?`
                : `Төлбөр баталгаажсан уу? ${PREMIUM_DURATION_MONTHS} сарын Premium эрх идэвхжүүлэх үү?`
            }
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Crown size={13} />
            {active
              ? `Сунгах (+${PREMIUM_DURATION_MONTHS} сар)`
              : `Идэвхжүүлэх (${PREMIUM_DURATION_MONTHS} сар)`}
          </ConfirmSubmitButton>
        </form>
        {active && (
          <form action={revokeAction}>
            <ConfirmSubmitButton
              confirmMessage="Энэ хэрэглэгчийн Premium эрхийг цуцлах уу? Үзээгүй Premium хичээлүүд нь шууд хаагдана."
              className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              Цуцлах
            </ConfirmSubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

export function UsersTable({ users }: { users: UserWithEmail[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.phone].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [users, query]);

  return (
    <div data-tour="admin-users-table">
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
          placeholder="Имэйл, утас, нэрээр хайх..."
          className="pl-9"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Нэр</th>
              <th className="px-5 py-3 font-medium">Имэйл</th>
              <th className="px-5 py-3 font-medium">Утас</th>
              <th className="px-5 py-3 font-medium">Эрх</th>
              <th className="px-5 py-3 font-medium text-right">Premium</th>
              <th className="px-5 py-3 font-medium text-right">Нууц үг</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3.5 font-medium text-navy-900">
                  {u.full_name ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-500">{u.email ?? "—"}</td>
                <td className="px-5 py-3.5 text-slate-500">{u.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={u.role === "admin" ? "brand" : "slate"}>
                    {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <PremiumCell
                    userId={u.id}
                    premiumUntil={u.premium_until}
                    active={isPremiumActive(u)}
                    isAdmin={u.role === "admin"}
                  />
                </td>
                <td className="px-5 py-3.5">
                  <GeneratePasswordCell userId={u.id} />
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
