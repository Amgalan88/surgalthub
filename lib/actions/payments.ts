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

  // The request references the learner's profiles row, which accounts made
  // before the signup trigger existed may lack. Creating it is a no-op otherwise.
  await supabase
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

  let { error } = await supabase.from("payment_requests").insert({
    user_id: user.id,
    amount: PREMIUM_PRICE_MNT,
    payer_name: payerName,
  });
  // PGRST204: no payer_name column yet (migration 0012 not run). The request
  // itself matters more than the optional name, so file it without.
  if (error?.code === "PGRST204") {
    ({ error } = await supabase
      .from("payment_requests")
      .insert({ user_id: user.id, amount: PREMIUM_PRICE_MNT }));
  }

  // 23505: a request is already open — the learner pressed twice, nothing to do.
  if (error && error.code !== "23505") {
    console.error("submitPaymentRequest failed:", error);
    // The code tells the admin whether it is the table, a permission or the profile.
    return {
      error: `Илгээж чадсангүй. Дахин оролдоно уу. (алдааны код: ${error.code || "тодорхойгүй"})`,
    };
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

export interface PromoFormState {
  error?: string;
  /** ISO date Premium now runs until, after a successful redeem. */
  until?: string;
}

const PROMO_ERRORS: Record<string, string> = {
  PROMO_LOGIN: "Эхлээд нэвтэрнэ үү.",
  PROMO_INVALID: "Ийм промо код алга. Үсэг, тоогоо шалгаад дахин оруулна уу.",
  PROMO_USED: "Энэ промо код аль хэдийн ашиглагдсан байна.",
};

/** Redeems a promo code for the signed-in learner: Premium starts at once. */
export async function redeemPromoCode(
  _prev: PromoFormState,
  formData: FormData
): Promise<PromoFormState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Промо кодоо оруулна уу." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_promo_code", { input_code: code });
  if (error) {
    const known = Object.keys(PROMO_ERRORS).find((key) => error.message?.includes(key));
    if (!known) console.error("redeemPromoCode failed:", error);
    return {
      error: known
        ? PROMO_ERRORS[known]
        : `Промо код идэвхжүүлж чадсангүй. (алдааны код: ${error.code || "тодорхойгүй"})`,
    };
  }

  refreshPaymentPages();
  return { until: data ?? undefined };
}
