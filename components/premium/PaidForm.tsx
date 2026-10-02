"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { submitPaymentRequest, type PaymentFormState } from "@/lib/actions/payments";

/** The "I have paid" button, with an optional note for transfers from someone else's account. */
export function PaidForm() {
  const [state, action, pending] = useActionState<PaymentFormState, FormData>(
    submitPaymentRequest,
    {}
  );
  const [otherPayer, setOtherPayer] = useState(false);

  return (
    <form action={action}>
      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={otherPayer}
          onChange={(e) => setOtherPayer(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        Өөр хүний данснаас шилжүүлсэн
      </label>
      {otherPayer && (
        <div className="mt-3">
          <Label htmlFor="payer_name">Шилжүүлсэн хүний нэр</Label>
          <Input
            id="payer_name"
            name="payer_name"
            maxLength={120}
            placeholder="Дансны эзэмшигчийн нэр"
            required
          />
        </div>
      )}

      {state.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-4 w-full" disabled={pending}>
        <CheckCircle2 size={18} />
        {pending ? "Илгээж байна..." : "Би төлбөрөө шилжүүлсэн"}
      </Button>
    </form>
  );
}
