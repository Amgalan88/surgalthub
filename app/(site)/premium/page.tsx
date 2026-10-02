import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Faq, FAQ_ITEMS } from "@/components/marketing/Faq";
import { PaymentFlow } from "@/components/premium/PaymentFlow";
import { getCurrentProfile } from "@/lib/auth";
import { getMyPaymentState } from "@/lib/data/payments";
import { formatMNT, PREMIUM_DURATION_MONTHS, PREMIUM_PRICE_MNT } from "@/lib/access";

export const metadata: Metadata = {
  title: "Premium эрх",
  description: `Нэг удаагийн ${formatMNT(PREMIUM_PRICE_MNT)} төлбөрөөр ${PREMIUM_DURATION_MONTHS} сарын турш Cargo Hub-ын бүх сургалтын бүх хичээлийг үзээрэй.`,
  alternates: { canonical: "/premium" },
};

const INCLUDED = [
  "Бүх курсын бүх видео хичээл",
  "Хичээл бүр дээр багшаас асуулт асуух",
  `${PREMIUM_DURATION_MONTHS} сарын турш хэдэн ч удаа үзнэ`,
  "Үзэж дуусгасан хичээл хугацааны дараа ч нээлттэй",
];

export default async function PremiumPage() {
  const profile = await getCurrentProfile();
  const payment = profile && profile.role !== "admin" ? await getMyPaymentState(profile.id) : null;

  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-gold-400" />
          Premium
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
          Бүх хичээлийг нэг төлбөрөөр
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
          Дансаар шилжүүлээд нэг товч дарахад л болно. Админ баталгаажуулмагц бүх хичээл
          нээгдэнэ.
        </p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
          <PaymentFlow profile={profile} payment={payment} />

          <aside className="rounded-xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
            <p className="text-sm font-medium text-slate-500">Нэг удаагийн төлбөр</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-tight text-navy-900">
                {formatMNT(PREMIUM_PRICE_MNT)}
              </span>
              <span className="text-slate-500">/ {PREMIUM_DURATION_MONTHS} сар</span>
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check size={17} className="mt-0.5 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="text-xl font-semibold text-navy-900">Түгээмэл асуулт</h2>
          <div className="mt-4">
            <Faq items={FAQ_ITEMS.slice(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
