import { BellRing, Check, X } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import {
  approvePaymentRequest,
  rejectPaymentRequest,
} from "@/lib/actions/admin/users";
import { formatMNT, PREMIUM_DURATION_MONTHS } from "@/lib/access";
import type { PendingPaymentRequest } from "@/lib/data/payments";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("mn-MN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Learners who pressed "Төлбөр шилжүүлсэн". Pinned above every admin page so
 * a payment is never left waiting because the admin was on another screen.
 */
export function PaymentRequestsBanner({
  requests,
}: {
  requests: PendingPaymentRequest[];
}) {
  if (requests.length === 0) return null;

  return (
    <section
      aria-label="Төлбөрийн мэдэгдэл"
      className="border-b border-amber-200 bg-amber-50 px-6 py-4 sm:px-8"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <BellRing size={16} />
        {requests.length} хэрэглэгч төлбөр шилжүүлсэн гэж мэдэгдсэн байна
      </p>
      <p className="mt-0.5 text-xs text-amber-800/80">
        Дансаа шалгаад гүйлгээ орсон бол батална уу — {PREMIUM_DURATION_MONTHS}{" "}
        сарын Premium эрх шууд нээгдэнэ.
      </p>

      <ul className="mt-3 space-y-2">
        {requests.map((r) => {
          const name = r.fullName?.trim() || r.email || "Нэргүй хэрэглэгч";
          return (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-lg bg-white p-3.5 ring-1 ring-inset ring-amber-600/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-navy-900">
                  {name}
                  {r.renewing && (
                    <span className="ml-2 text-xs font-medium text-emerald-700">
                      сунгалт
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-slate-500">
                  {[r.phone, r.email, formatMNT(r.amount), formatDateTime(r.created_at)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <form action={approvePaymentRequest.bind(null, r.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`${name}-ийн ${formatMNT(r.amount)} гүйлгээ дансанд орсон уу? ${PREMIUM_DURATION_MONTHS} сарын Premium эрх нээх үү?`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    <Check size={15} />
                    Батлах
                  </ConfirmSubmitButton>
                </form>
                <form action={rejectPaymentRequest.bind(null, r.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`${name}-ийн төлбөрийг цуцлах уу? Гүйлгээ олдоогүй гэж хэрэглэгчид харагдана.`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <X size={15} />
                    Цуцлах
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
