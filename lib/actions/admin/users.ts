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
  await requireAdmin();

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Тохиргоо дутуу байна.",
    };
  }

  const password = generateRandomPassword();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { password };
}

export async function activatePremiumAccess(userId: string) {
  await requireAdmin();

  const until = new Date();
  until.setMonth(until.getMonth() + PREMIUM_DURATION_MONTHS);

  const supabase = await createClient();
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
