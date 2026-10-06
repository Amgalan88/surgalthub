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
  const { data: approved, error } = await supabase.rpc("approve_payment_request", {
    request_id: requestId,
    extend_months: PREMIUM_DURATION_MONTHS,
  });
  if (error) return { error: error.message };
  refresh();
  // False when it was no longer pending: another admin (or tab) got there first.
  if (!approved) return { error: "Энэ хүсэлт аль хэдийн шийдвэрлэгдсэн байна." };
  return {};
}

export async function rejectPaymentRequest(
  requestId: string,
  note: string
): Promise<ReviewResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const decision = {
    status: "rejected" as const,
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  };
  let { error } = await supabase
    .from("payment_requests")
    .update({ ...decision, admin_note: note.trim().slice(0, 500) || null })
    .eq("id", requestId)
    .eq("status", "pending");
  // PGRST204: no admin_note column yet (migration 0012 not run); reject without the reason.
  if (error?.code === "PGRST204") {
    ({ error } = await supabase
      .from("payment_requests")
      .update(decision)
      .eq("id", requestId)
      .eq("status", "pending"));
  }
  if (error) return { error: error.message };
  refresh();
  return {};
}
