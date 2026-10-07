"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Ticket } from "lucide-react";
import { redeemPromoCode, type PromoFormState } from "@/lib/actions/payments";

/** "2027 оны 4-р сарын 7": written out, since not every browser ships Mongolian dates. */
function mongolianDate(value: string) {
  const d = new Date(value);
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`;
}

/** "Have a promo code?" — redeeming one turns Premium on straight away. */
export function PromoForm({ signedIn }: { signedIn: boolean }) {
  const [state, action, pending] = useActionState<PromoFormState, FormData>(redeemPromoCode, {});

  if (state.until) {
    return (
      <div id="promo" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="flex items-center gap-2 font-semibold text-emerald-800">
          <CheckCircle2 size={18} /> Premium идэвхжлээ!
        </p>
        <p className="mt-1 text-sm text-emerald-900/80">
          {mongolianDate(state.until)} хүртэл бүх курсын бүх хичээл танд нээлттэй.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Хичээлээ үзэх
        </Link>
      </div>
    );
  }

  return (
    <div id="promo" className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5">
      <p className="flex items-center gap-2 font-semibold text-navy-900">
        <Ticket size={18} className="text-brand-600" /> Промо код байгаа юу?
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Байгууллагаасаа авсан кодоо оруулбал төлбөргүйгээр шууд Premium нээгдэнэ.
      </p>
      {signedIn ? (
        <form action={action} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            name="code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="CH-XXXX-XXXX"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {pending ? "Шалгаж байна..." : "Идэвхжүүлэх"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm">
          <Link href="/login?next=/premium" className="font-medium text-brand-700 underline underline-offset-2">
            Нэвтэрч
          </Link>{" "}
          эсвэл{" "}
          <Link href="/register?next=/premium" className="font-medium text-brand-700 underline underline-offset-2">
            бүртгүүлж
          </Link>{" "}
          байж кодоо оруулна.
        </p>
      )}
      {state.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}
