"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_PRICE_MNT } from "@/lib/access";

export interface PaymentFormState {
  error?: string;
}

function refreshPaymentPages() {
  revalidatePath("/premium");
  revalidatePath("/dashboard");
  revalidatePath("/admin", "layout");
}

/** "I have paid": opens a request for the admin to check against the bank. */
export async function submitPaymentRequest(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Эхлээд нэвтэрнэ үү." };

  const payerName = String(formData.get("payer_name") ?? "").trim().slice(0, 120) || null;

  const { error } = await supabase.from("payment_requests").insert({
    user_id: user.id,
    amount: PREMIUM_PRICE_MNT,
    payer_name: payerName,
  });

  // 23505: a request is already open — the learner pressed twice, nothing to do.
  if (error && error.code !== "23505") {
    console.error("submitPaymentRequest failed:", error);
    return { error: "Илгээж чадсангүй. Дахин оролдоно уу." };
  }

  refreshPaymentPages();
  return {};
}

export async function cancelPaymentRequest(requestId: string) {
  const supabase = await createClient();
  // RLS only lets the owner delete a request that is still pending.
  await supabase.from("payment_requests").delete().eq("id", requestId);
  refreshPaymentPages();
}
