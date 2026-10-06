"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_PRICE_MNT } from "@/lib/access";

export interface ReportPaymentState {
  error?: string;
  success?: boolean;
}

/**
 * The learner says they have transferred the Premium fee. Files a pending
 * request that shows up as a banner for every admin to approve or reject.
 */
export async function reportPaymentSent(): Promise<ReportPaymentState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Эхлээд нэвтэрнэ үү." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_requests")
    .insert({ user_id: profile.id, amount: PREMIUM_PRICE_MNT });

  // 23505: the one-pending-request-per-learner index. The admin already has
  // this learner in the queue, which is what they wanted.
  if (error && error.code !== "23505") {
    console.error("reportPaymentSent failed:", error);
    return { error: "Мэдэгдэл илгээж чадсангүй. Дахин оролдоно уу." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
