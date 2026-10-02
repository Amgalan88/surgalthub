import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
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
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200 ring-1 ring-inset ring-white/20">
            <Crown size={13} /> Premium
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Бүх хичээлийг нэг эрхээр
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">
            Курс тус бүрд тусад нь төлөх шаардлагагүй. Нэг удаа төлөөд платформ
            дээрх бүх сургалтын бүх хичээлийг нээнэ.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {profile ? (
          <PremiumStatusCard profile={profile} className="mb-8" />
        ) : (
          <div className="mb-8 rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 ring-1 ring-inset ring-slate-500/20">
            Эрхээ идэвхжүүлэхийн тулд эхлээд{" "}
            <Link href="/register" className="font-semibold text-brand-700">
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

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-navy-900">Түгээмэл асуулт</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-navy-900">
                Хугацаа дуусвал юу болох вэ?
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-500">
                Үнэгүй хичээлүүд болон таны аль хэдийн үзсэн хичээлүүд нээлттэй
                хэвээр үлдэнэ. Зөвхөн шинээр үзээгүй Premium хичээлүүд хаагдана.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-navy-900">
                Төлбөр төлсөн ч эрх нээгдэхгүй байна?
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-500">
                Эрхийг админ гараар баталгаажуулдаг тул бага зэрэг хугацаа
                шаардаж болно. Баримтаа бүртгүүлсэн нэр, утас, имэйлийн хамт
                илгээсэн эсэхээ шалгаад админтай холбогдоорой.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-navy-900">
                Курс тус бүрд тусад нь төлөх үү?
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-500">
                Үгүй. Энэ бол платформ даяарх нэг эрх — бүх сургалтад нэгэн зэрэг
                хамаарна.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
