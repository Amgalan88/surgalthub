import type { Metadata } from "next";
import Link from "next/link";
import { Faq, FAQ_ITEMS } from "@/components/marketing/Faq";
import { PremiumStatusCard } from "@/components/premium/PremiumStatusCard";
import { PaymentInstructions } from "@/components/premium/PaymentInstructions";
import { getCurrentProfile } from "@/lib/auth";
import { formatMNT, PREMIUM_DURATION_MONTHS, PREMIUM_PRICE_MNT } from "@/lib/access";

export const metadata: Metadata = {
  title: "Premium эрх",
  description: `Нэг удаагийн ${formatMNT(PREMIUM_PRICE_MNT)} төлбөрөөр ${PREMIUM_DURATION_MONTHS} сарын турш Cargo Hub-ын бүх сургалтын бүх хичээлийг үзээрэй.`,
  alternates: { canonical: "/premium" },
};

export default async function PremiumPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Premium
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Бүх хичээлийг нэг төлбөрөөр
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Курс тус бүрд тусад нь төлөхгүй. Нэг удаа төлөөд{" "}
            {PREMIUM_DURATION_MONTHS} сарын турш бүх курсын бүх хичээлийг үзнэ.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {profile ? (
          <PremiumStatusCard profile={profile} className="mb-8" />
        ) : (
          <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Эрхээ идэвхжүүлэхийн тулд эхлээд{" "}
            <Link href="/register?next=/premium" className="font-semibold text-brand-700">
              бүртгүүлэх
            </Link>{" "}
            эсвэл{" "}
            <Link href="/login?next=/premium" className="font-semibold text-brand-700">
              нэвтрэх
            </Link>{" "}
            хэрэгтэй.
          </div>
        )}

        {/* Admins already have unlimited access, so payment steps are noise. */}
        {profile?.role !== "admin" && <PaymentInstructions />}

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-navy-900">Түгээмэл асуулт</h2>
          <div className="mt-4">
            <Faq items={FAQ_ITEMS.slice(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
