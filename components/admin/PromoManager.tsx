"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { createPromoCodes, revokePromoCode } from "@/lib/actions/admin/promo";
import type { AdminPromoCode } from "@/lib/data/promo";

/** YYYY.MM.DD, built by hand: locale formatting differs between server and browser. */
function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function CopyAllButton({ codes, label }: { codes: string[]; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={codes.length === 0}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(codes.join("\n"));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: the codes stay on screen to copy by hand.
        }
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-default disabled:opacity-50"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? "Хуулагдлаа" : label}
    </button>
  );
}

function CreatePanel() {
  const [count, setCount] = useState(5);
  const [note, setNote] = useState("");
  const [months, setMonths] = useState(6);
  const [created, setCreated] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function create() {
    setError(null);
    startTransition(async () => {
      const result = await createPromoCodes(count, note, months);
      if (result.error) setError(result.error);
      else setCreated(result.codes ?? []);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-navy-900">Шинэ код үүсгэх</h2>
      <p className="mt-1 text-sm text-slate-500">
        Код бүрийг зөвхөн нэг хүн ашиглана. Хэрэглэгч Premium хуудсанд оруулахад эрх шууд нээгдэнэ.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[110px_1fr_140px_auto] sm:items-end">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Хэдэн код</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Хэнд зориулсан (заавал биш)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder="Жишээ нь: ABC компани"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Premium хугацаа</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {[1, 3, 6, 12].map((m) => (
              <option key={m} value={m}>
                {m} сар
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={create}
          disabled={pending}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Plus size={16} /> {pending ? "Үүсгэж байна..." : "Код үүсгэх"}
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}

      {created && created.length > 0 && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-emerald-800">
              {created.length} шинэ код бэлэн боллоо
            </p>
            <CopyAllButton codes={created} label="Бүгдийг хуулах" />
          </div>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((code) => (
              <code key={code} className="rounded-md bg-white px-3 py-1.5 font-mono text-sm text-navy-900 ring-1 ring-inset ring-emerald-200">
                {code}
              </code>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type Filter = "all" | "unused" | "used";

function statusOf(code: AdminPromoCode): "unused" | "used" | "revoked" {
  if (code.revoked_at) return "revoked";
  if (code.redeemed_by || code.redeemed_at) return "used";
  return "unused";
}

/** Create codes in a batch, then track who used which. */
export function PromoManager({ codes }: { codes: AdminPromoCode[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: codes.length,
      unused: codes.filter((c) => statusOf(c) === "unused").length,
      used: codes.filter((c) => statusOf(c) === "used").length,
    }),
    [codes]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes.filter((c) => {
      if (filter !== "all" && statusOf(c) !== filter) return false;
      if (!q) return true;
      return [c.code, c.note, c.redeemerName, c.redeemerPhone].some((f) => f?.toLowerCase().includes(q));
    });
  }, [codes, filter, query]);

  const unusedVisible = visible.filter((c) => statusOf(c) === "unused").map((c) => c.code);

  function revoke(code: string) {
    if (!window.confirm(`${code} кодыг цуцлах уу? Цуцалсан кодыг хэн ч ашиглах боломжгүй болно.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await revokePromoCode(code);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <CreatePanel />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
            {(
              [
                ["all", "Бүгд"],
                ["unused", "Ашиглаагүй"],
                ["used", "Ашигласан"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 font-medium",
                  filter === key ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-900"
                )}
              >
                {label} <span className="tabular-nums text-slate-400">{counts[key]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Код, байгууллагаар хайх"
                className="w-64 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <CopyAllButton codes={unusedVisible} label={`Ашиглаагүй ${unusedVisible.length} кодыг хуулах`} />
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}

        <div className={cn("mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white", pending && "opacity-60")}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Код</th>
                <th className="px-4 py-2.5 font-medium">Хэнд зориулсан</th>
                <th className="px-4 py-2.5 font-medium">Хугацаа</th>
                <th className="px-4 py-2.5 font-medium">Төлөв</th>
                <th className="px-4 py-2.5 font-medium">Үүсгэсэн</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((c) => {
                const status = statusOf(c);
                return (
                  <tr key={c.code} className={cn(status === "revoked" && "text-slate-400")}>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={cn("font-mono", status === "revoked" ? "line-through" : "text-navy-900")}>
                        {c.code}
                      </span>
                      {status === "unused" && (
                        <CopyButton value={c.code} label="Код хуулах" className="ml-1 h-7 w-7 align-middle text-slate-400 hover:bg-slate-100 hover:text-navy-900" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.note ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{c.months} сар</td>
                    <td className="px-4 py-2.5">
                      {status === "unused" ? (
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">Ашиглаагүй</span>
                      ) : status === "used" ? (
                        <span className="text-xs text-slate-600">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">Ашигласан</span>
                          <span className="ml-2">
                            {c.redeemerName ?? "Хэрэглэгч"}
                            {c.redeemerPhone && ` · ${c.redeemerPhone}`} · {formatDate(c.redeemed_at)}
                          </span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Цуцалсан</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {status === "unused" && (
                        <button
                          type="button"
                          onClick={() => revoke(c.code)}
                          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          Цуцлах
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    {codes.length === 0 ? "Одоогоор код үүсгээгүй байна." : "Тохирох код олдсонгүй."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
