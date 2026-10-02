"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_DURATION_MONTHS } from "@/lib/access";

export interface ReviewResult {
  error?: string;
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/premium");
  revalidatePath("/dashboard");
}

/** Extends the learner's Premium and closes the request, atomically in the database. */
export async function approvePaymentRequest(requestId: string): Promise<ReviewResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_payment_request", {
    request_id: requestId,
    months: PREMIUM_DURATION_MONTHS,
  });
  if (error) return { error: error.message };
  refresh();
  return {};
}

export async function rejectPaymentRequest(
  requestId: string,
  note: string
): Promise<ReviewResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: "rejected",
      admin_note: note.trim().slice(0, 500) || null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");
  if (error) return { error: error.message };
  refresh();
  return {};
}
