import Link from "next/link";
import { Clock, Info, Infinity as InfinityIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { PaidForm } from "./PaidForm";
import { cancelPaymentRequest } from "@/lib/actions/payments";
import {
  formatMNT,
  formatPremiumDate,
  isPremiumActive,
  PAYMENT_INFO,
  PREMIUM_DURATION_MONTHS,
  PREMIUM_PRICE_MNT,
} from "@/lib/access";
import type { MyPaymentState } from "@/lib/data/payments";
import type { Profile } from "@/lib/types";

/** What goes in the transfer description, so the admin can match it on the statement. */
export function transferReference(profile: Profile | null): string | null {
  return profile?.phone?.trim() || profile?.full_name?.trim() || null;
}

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-12">
      <span
        className={
          "absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold " +
          (done ? "bg-emerald-50 text-emerald-700" : "bg-navy-900 text-white")
        }
      >
        {n}
      </span>
      <h3 className="pt-1 font-semibold text-navy-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </li>
  );
}

function TransferDetails({ reference }: { reference: string | null }) {
  const rows = [
    { label: "Банк", value: PAYMENT_INFO.bank },
    { label: "Дансны дугаар", value: PAYMENT_INFO.account, copy: true, mono: true },
    { label: "Хүлээн авагч", value: PAYMENT_INFO.accountHolder },
    { label: "Дүн", value: formatMNT(PREMIUM_PRICE_MNT), copy: true, copyValue: String(PREMIUM_PRICE_MNT) },
    reference
      ? { label: "Гүйлгээний утга", value: reference, copy: true, highlight: true }
      : { label: "Гүйлгээний утга", value: "Таны утасны дугаар", highlight: true },
  ];
  return (
    <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="text-slate-500">{row.label}</dt>
          <dd
            className={
              "flex items-center gap-1 text-right font-medium " +
              (row.highlight ? "text-brand-700" : "text-navy-900") +
              (row.mono ? " font-mono text-[15px]" : "")
            }
          >
            {row.value}
            {row.copy && (
              <CopyButton
                value={row.copyValue ?? row.value}
                label={`${row.label} хуулах`}
                className="-mr-2 text-slate-400 hover:bg-slate-200 hover:text-navy-900"
              />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The whole way to Premium on one card: transfer, press "I have paid", wait
 * for the admin. Each state of the request gets its own clear message.
 */
export function PaymentFlow({
  profile,
  payment,
}: {
  profile: Profile | null;
  payment: MyPaymentState | null;
}) {
  if (profile?.role === "admin") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-navy-900">
          <InfinityIcon size={18} className="text-brand-600" /> Та админ эрхтэй
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Бүх хичээл танд нээлттэй. Суралцагчдын төлбөрийг{" "}
          <Link href="/admin/payments" className="font-medium text-brand-700 underline underline-offset-2">
            Төлбөрүүд
          </Link>{" "}
          хэсгээс баталгаажуулна.
        </p>
      </div>
    );
  }

  const reference = transferReference(profile);
  const active = isPremiumActive(profile);

  if (payment?.pending) {
    const cancel = cancelPaymentRequest.bind(null, payment.pending.id);
    return (
      <div className="rounded-xl border border-gold-300 bg-gold-100/50 p-6">
        <p className="flex items-center gap-2 font-semibold text-navy-900">
          <Clock size={18} className="text-gold-700" /> Таны төлбөрийг шалгаж байна
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          {formatPremiumDate(payment.pending.created_at)}-нд илгээсэн. Админ дансаа шалгаж
          баталгаажуулмагц бүх хичээл автоматаар нээгдэнэ. Та энэ хуудсыг хааж, хичээлээ
          үргэлжлүүлж болно.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-slate-500">Дүн:</dt>
            <dd className="font-medium text-navy-900">{formatMNT(payment.pending.amount)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500">Гүйлгээний утга:</dt>
            <dd className="font-medium text-navy-900">{reference ?? "—"}</dd>
          </div>
        </dl>
        <form action={cancel} className="mt-5">
          <button
            type="submit"
            className="cursor-pointer text-sm text-slate-500 underline underline-offset-2 hover:text-navy-900"
          >
            Буруу дарсан бол хүсэлтээ цуцлах
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-navy-900">
        {active ? "Хугацаа сунгах" : "Premium авах"}
      </h2>
      {active && profile?.premium_until && (
        <p className="mt-1 text-sm text-slate-600">
          Таны эрх {formatPremiumDate(profile.premium_until)} хүртэл хүчинтэй. Сунгавал үлдсэн
          хугацаан дээр {PREMIUM_DURATION_MONTHS} сар нэмэгдэнэ.
        </p>
      )}

      {payment?.rejected && (
        <div className="mt-5 flex gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          <Info size={17} className="mt-0.5 shrink-0" />
          <p>
            Өмнөх төлбөр тань баталгаажаагүй
            {payment.rejected.admin_note
              ? `: ${payment.rejected.admin_note.replace(/[.!]?$/, ".")}`
              : "."}{" "}
            Шалгаад дахин илгээнэ үү.
          </p>
        </div>
      )}

      <ol className="mt-6 space-y-8">
        {!profile && (
          <Step n={1} title="Бүртгүүлэх эсвэл нэвтрэх">
            <p className="text-sm text-slate-600">
              Эрх таны бүртгэл дээр нээгдэнэ. Бүртгүүлэх үнэгүй, 1 минут болно.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LinkButton href="/register?next=/premium">Бүртгүүлэх</LinkButton>
              <LinkButton href="/login?next=/premium" variant="outline">
                Нэвтрэх
              </LinkButton>
            </div>
          </Step>
        )}

        <Step n={profile ? 1 : 2} title="Дансанд шилжүүлэх">
          <TransferDetails reference={reference} />
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {profile?.phone
              ? "Гүйлгээний утга дээр бүртгэлтэй утасны дугаараа бичнэ. Ингэснээр админ таны төлбөрийг шууд танина."
              : "Гүйлгээний утга дээр бүртгүүлсэн утасны дугаараа бичнэ."}
          </p>
        </Step>

        <Step n={profile ? 2 : 3} title="Шилжүүлснээ мэдэгдэх">
          {profile ? (
            payment?.available === false ? (
              <p className="text-sm text-slate-600">
                Гүйлгээний баримтаа админд илгээнэ үү. Баталгаажмагц эрх нээгдэнэ.
              </p>
            ) : (
              <PaidForm />
            )
          ) : (
            <p className="text-sm text-slate-600">
              Нэвтэрсний дараа &quot;Би төлбөрөө шилжүүлсэн&quot; товч энд гарна.
            </p>
          )}
        </Step>

        <Step n={profile ? 3 : 4} title="Эрх нээгдэнэ">
          <p className="text-sm leading-relaxed text-slate-600">
            Админ төлбөрийг шалгаж баталгаажуулмагц {PREMIUM_DURATION_MONTHS} сарын турш бүх
            курсын бүх хичээл автоматаар нээгдэнэ.
            {payment?.available !== false && " Баримт илгээх шаардлагагүй."}
          </p>
        </Step>
      </ol>
    </div>
  );
}
