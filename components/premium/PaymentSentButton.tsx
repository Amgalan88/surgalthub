"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { reportPaymentSent, type ReportPaymentState } from "@/lib/actions/payments";
import type { PaymentRequest } from "@/lib/types";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("mn-MN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * "I've paid" button on the payment card. Pressing it notifies the admins;
 * once a request is open it turns into a status line so the learner knows
 * the payment is being checked and does not keep pressing it.
 */
export function PaymentSentButton({
  signedIn,
  latestRequest,
}: {
  signedIn: boolean;
  latestRequest: PaymentRequest | null;
}) {
  const [state, formAction, pending] = useActionState<ReportPaymentState>(
    reportPaymentSent,
    {}
  );

  if (!signedIn) {
    return (
      <p className="mt-5 text-sm text-slate-500">
        Төлбөр шилжүүлснээ мэдэгдэхийн тулд{" "}
        <Link href="/login?next=/premium" className="font-semibold text-brand-700">
          нэвтэрнэ үү
        </Link>
        .
      </p>
    );
  }

  if (latestRequest?.status === "pending") {
    return (
      <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 ring-1 ring-inset ring-amber-600/20">
        <Clock size={18} className="mt-0.5 shrink-0 text-amber-700" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Төлбөр шалгагдаж байна</p>
          <p className="mt-0.5 text-amber-800/90">
            {formatDateTime(latestRequest.created_at)}-д мэдэгдсэн. Админ
            гүйлгээг баталгаажуулмагц Premium эрх тань автоматаар нээгдэнэ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-5">
      {latestRequest?.status === "rejected" && (
        <div className="mb-4 flex gap-3 rounded-lg bg-red-50 p-4 ring-1 ring-inset ring-red-600/20">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-800">Төлбөр баталгаажаагүй</p>
            <p className="mt-0.5 text-red-700/90">
              Таны {formatDateTime(latestRequest.created_at)}-ийн мэдэгдэлд
              тохирох гүйлгээ олдсонгүй. Дансны дугаар, дүн, гүйлгээний утгаа
              шалгаад дахин мэдэгдэнэ үү.
            </p>
          </div>
        </div>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <BadgeCheck size={18} />
        {pending ? "Илгээж байна..." : "Төлбөр шилжүүлсэн"}
      </Button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-slate-500">
          Шилжүүлгээ хийсний дараа дарна уу — админд мэдэгдэл очно.
        </p>
      )}
    </form>
  );
}
