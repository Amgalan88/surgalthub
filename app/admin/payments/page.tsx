import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { PaymentReview } from "@/components/admin/PaymentReview";
import { getPaymentRequestsAdmin } from "@/lib/data/payments";
import { formatMNT, PAYMENT_INFO } from "@/lib/access";

export const metadata: Metadata = { title: "Төлбөрүүд" };

const MIGRATIONS_URL = "https://github.com/Amgalan88/surgalthub/blob/main/supabase/migrations";
const SETUP_FILES = [
  "0011_payment_requests.sql",
  "0012_payment_request_details.sql",
  "0013_payment_requests_access.sql",
];

export default async function AdminPaymentsPage() {
  const { available, error, pending, reviewed } = await getPaymentRequestsAdmin();

  return (
    <div className="max-w-4xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Төлбөрүүд</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        Суралцагч &quot;Би төлбөрөө шилжүүлсэн&quot; дарахад энд гарч ирнэ. {PAYMENT_INFO.bank}{" "}
        аппаа нээж, гүйлгээний утга дээрх <b>утасны дугаараар</b> тулгаад шийдвэрээ гаргана.
      </p>

      {!available ? (
        <div className="mt-8 rounded-xl border border-gold-300 bg-gold-100/60 p-6 text-sm text-navy-900">
          <p className="font-semibold">Нэг удаагийн тохиргоо хэрэгтэй</p>
          <p className="mt-1 text-slate-700">
            Төлбөрийн хүснэгт үүсээгүй эсвэл сайтад түүнийг унших эрх олгогдоогүй байна.
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-700">
            <li>
              Доорх файлуудыг дарааллаар нь нээж, агуулгыг бүхэлд нь хуулна:
              <ul className="mt-1 space-y-0.5">
                {SETUP_FILES.map((file) => (
                  <li key={file}>
                    <a
                      href={`${MIGRATIONS_URL}/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-medium text-brand-700 underline"
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              Тус бүрийг Supabase → SQL Editor → New query хэсэгт буулгаад <b>Run</b> дарна.
              Аль хэдийн ажиллуулсан файлыг дахин ажиллуулахад аюулгүй.
            </li>
            <li>Энэ хуудсыг дахин ачаална.</li>
          </ol>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold">Төлбөрийн хүсэлтүүдийг уншиж чадсангүй</p>
          <p className="mt-1 font-mono text-xs">{error}</p>
        </div>
      ) : (
        <>
          <h2 className="mt-8 flex items-center gap-2 font-semibold text-navy-900">
            Шийдвэр хүлээж буй
            {pending.length > 0 && <Badge tone="brand">{pending.length}</Badge>}
          </h2>
          {pending.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Одоогоор шалгах төлбөр алга.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {pending.map((request) => (
                <PaymentReview key={request.id} request={request} />
              ))}
            </ul>
          )}

          {reviewed.length > 0 && (
            <>
              <h2 className="mt-12 font-semibold text-navy-900">Сүүлд шийдвэрлэсэн</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Суралцагч</th>
                      <th className="px-4 py-2.5 font-medium">Утас</th>
                      <th className="px-4 py-2.5 font-medium">Дүн</th>
                      <th className="px-4 py-2.5 font-medium">Шийдвэр</th>
                      <th className="px-4 py-2.5 font-medium">Огноо</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviewed.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-navy-900">{r.fullName ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{r.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatMNT(r.amount)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={r.status === "approved" ? "green" : "red"}>
                            {r.status === "approved" ? "Баталгаажсан" : "Татгалзсан"}
                          </Badge>
                          {r.admin_note && (
                            <p className="mt-1 text-xs text-slate-500">{r.admin_note}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString("mn-MN") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
