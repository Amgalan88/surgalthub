import type { Metadata } from "next";
import { PromoManager } from "@/components/admin/PromoManager";
import { getPromoCodesAdmin } from "@/lib/data/promo";

export const metadata: Metadata = { title: "Промо код" };

const MIGRATION_URL =
  "https://github.com/Amgalan88/surgalthub/blob/main/supabase/migrations/0015_promo_codes.sql";

export default async function AdminPromoPage() {
  const { available, codes } = await getPromoCodesAdmin();

  return (
    <div className="max-w-6xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Промо код</h1>
      <p className="mt-1 text-sm text-slate-500">
        Хамтран ажилладаг байгууллага, хүмүүст өгөх кодууд. Код оруулсан хэрэглэгчид Premium шууд
        нээгдэх тул төлбөр шалгах шаардлагагүй.
      </p>

      <div className="mt-6">
        {available ? (
          <PromoManager codes={codes} />
        ) : (
          <div className="max-w-3xl rounded-xl border border-gold-300 bg-gold-100/60 p-6 text-sm text-navy-900">
            <p className="font-semibold">Нэг удаагийн тохиргоо хэрэгтэй</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-700">
              <li>
                <a href={MIGRATION_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline">
                  Энэ SQL файлыг
                </a>{" "}
                нээгээд агуулгыг бүхэлд нь хуулна.
              </li>
              <li>Supabase → SQL Editor → New query хэсэгт буулгаад <b>Run</b> дарна.</li>
              <li>Энэ хуудсыг дахин ачаална.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
