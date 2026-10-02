import { Landmark, Send, Unlock } from "lucide-react";
import {
  formatMNT,
  PAYMENT_INFO,
  PREMIUM_DURATION_MONTHS,
  PREMIUM_PRICE_MNT,
} from "@/lib/access";
import { hasSupportContact } from "@/lib/support";
import { SupportLinks } from "@/components/SupportLinks";
import { CopyButton } from "@/components/ui/CopyButton";

const steps = [
  {
    icon: Landmark,
    title: "Төлбөрөө шилжүүлэх",
    body: `${PAYMENT_INFO.bank} — ${PAYMENT_INFO.account} (${PAYMENT_INFO.accountHolder}) дансанд ${formatMNT(PREMIUM_PRICE_MNT)} шилжүүлнэ. Гүйлгээний утга дээр өөрийн нэрээ бичээрэй.`,
  },
  {
    icon: Send,
    title: "Баримтаа админд илгээх",
    body: "Гүйлгээний баримтаа бүртгүүлсэн нэр, утас, имэйлийнхээ хамт админд илгээнэ.",
  },
  {
    icon: Unlock,
    title: "Эрх нээгдэнэ",
    body: `Админ баталгаажуулмагц ${PREMIUM_DURATION_MONTHS} сарын турш бүх хичээл хүссэн үедээ нээлттэй болно.`,
  },
];

export function PaymentInstructions() {
  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Нэг удаагийн төлбөр</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-navy-900">
          {formatMNT(PREMIUM_PRICE_MNT)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {PREMIUM_DURATION_MONTHS} сарын турш бүх сургалтын бүх хичээл нээлттэй.
        </p>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Шилжүүлэх данс
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Банк</dt>
              <dd className="font-medium text-navy-900">{PAYMENT_INFO.bank}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Дансны дугаар</dt>
              <dd className="flex items-center gap-1 font-mono text-base font-semibold text-navy-900">
                {PAYMENT_INFO.account}
                <CopyButton
                  value={PAYMENT_INFO.account}
                  label="Дансны дугаар хуулах"
                  className="text-slate-400 hover:bg-slate-200 hover:text-navy-900"
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Хүлээн авагч</dt>
              <dd className="font-medium text-navy-900">
                {PAYMENT_INFO.accountHolder}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Дүн</dt>
              <dd className="flex items-center gap-1 font-semibold text-navy-900">
                {formatMNT(PREMIUM_PRICE_MNT)}
                <CopyButton
                  value={String(PREMIUM_PRICE_MNT)}
                  label="Дүн хуулах"
                  className="text-slate-400 hover:bg-slate-200 hover:text-navy-900"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ol className="mt-6 grid gap-4 sm:grid-cols-3" data-tour="premium-steps">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon size={17} />
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {i + 1}-р алхам
                </span>
              </div>
              <p className="mt-3 font-semibold text-navy-900">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>

      {hasSupportContact() && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-semibold text-navy-900">Баримтаа илгээх</p>
          <p className="mt-1 text-sm text-slate-500">
            Гүйлгээний баримтын зургаа доорх сувгийн аль нэгээр илгээгээрэй.
          </p>
          <SupportLinks className="mt-4" />
        </div>
      )}
    </div>
  );
}
