"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
