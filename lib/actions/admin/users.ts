"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PREMIUM_DURATION_MONTHS } from "@/lib/access";
import type { UserRole } from "@/lib/types";

export async function setUserRole(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== "admin") {
    throw new Error("Өөрийгөө админаас хасах боломжгүй.");
  }

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

// Exclude visually ambiguous characters (0/O, 1/l/I) since admins relay
// this out loud over the phone.
const PASSWORD_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function generateRandomPassword(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)];
  }
  return out;
}

export interface GeneratePasswordResult {
  password?: string;
  error?: string;
}

export async function generateUserPassword(
  userId: string
): Promise<GeneratePasswordResult> {
  try {
    await requireAdmin();

    const adminClient = createAdminClient();
    const password = generateRandomPassword();
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { password };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Тодорхойгүй алдаа гарлаа.",
    };
  }
}

/**
 * Grants (or renews) Premium. Renewing before expiry stacks on top of the
 * remaining time, so a learner who pays early never loses days they bought.
 */
export async function activatePremiumAccess(userId: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_until")
    .eq("id", userId)
    .maybeSingle();

  const now = Date.now();
  const current = profile?.premium_until
    ? new Date(profile.premium_until).getTime()
    : 0;
  const until = new Date(Math.max(now, current));
  until.setMonth(until.getMonth() + PREMIUM_DURATION_MONTHS);

  await supabase
    .from("profiles")
    .update({ premium_until: until.toISOString() })
    .eq("id", userId);

  revalidatePath("/admin/users");
}

export async function revokePremiumAccess(userId: string) {
  await requireAdmin();

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ premium_until: null })
    .eq("id", userId);

  revalidatePath("/admin/users");
}

/**
 * Approves a learner's "I've paid" request and grants Premium in one database
 * transaction, so a double click or two admins at once never extend it twice.
 */
export async function approvePaymentRequest(requestId: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_payment_request", {
    request_id: requestId,
    extend_months: PREMIUM_DURATION_MONTHS,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

/** The transfer never arrived; the learner sees this and can try again. */
export async function rejectPaymentRequest(requestId: string) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq("id", requestId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
