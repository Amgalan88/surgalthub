"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/actions/admin/payments";
import { formatMNT, PREMIUM_DURATION_MONTHS } from "@/lib/access";
import type { AdminPaymentRequest } from "@/lib/data/payments";

const REJECT_REASONS = [
  "Төлбөр дансанд орж ирээгүй",
  "Шилжүүлсэн дүн дутуу",
  "Гүйлгээний утга таарахгүй байна",
];

function timeAgo(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} минутын өмнө`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  return `${Math.round(hours / 24)} өдрийн өмнө`;
}

/** One open "I have paid" request with the two decisions the admin can make. */
export function PaymentReview({ request }: { request: AdminPaymentRequest }) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-navy-900">{request.fullName ?? "Нэргүй хэрэглэгч"}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {timeAgo(request.created_at)} · {formatMNT(request.amount)}
            {request.renewing && " · сунгалт"}
          </p>
          {request.payer_name && (
            <p className="mt-1 text-sm text-slate-600">
              Шилжүүлсэн: <span className="font-medium text-navy-900">{request.payer_name}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Гүйлгээний утга</p>
          <p className="flex items-center justify-end gap-0.5 font-mono text-lg font-semibold text-navy-900">
            {request.phone ?? "—"}
            {request.phone && (
              <CopyButton
                value={request.phone}
                label="Утас хуулах"
                className="text-slate-400 hover:bg-slate-100 hover:text-navy-900"
              />
            )}
          </p>
        </div>
      </div>

      {rejecting ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-navy-900">Татгалзах шалтгаан</p>
          <p className="text-xs text-slate-500">Суралцагч энэ бичвэрийг Premium хуудсан дээр харна.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={
                  "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset " +
                  (reason === r
                    ? "bg-navy-900 text-white ring-navy-900"
                    : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-100")
                }
              >
                {r}
              </button>
            ))}
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => rejectPaymentRequest(request.id, reason))}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Хадгалж байна..." : "Татгалзах"}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              Болих
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => approvePaymentRequest(request.id))}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check size={16} />
            {pending ? "Баталгаажуулж байна..." : `Төлбөр орсон — ${PREMIUM_DURATION_MONTHS} сар нээх`}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setRejecting(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={16} /> Орж ирээгүй
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </li>
  );
}
