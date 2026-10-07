"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_DURATION_MONTHS } from "@/lib/access";

// No 0/O or 1/I/L: codes get read out over the phone and typed by hand.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomBlock(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** e.g. CH-7KQM-X3RP: 8 random characters, far too many to guess. */
function newCode() {
  return `CH-${randomBlock(4)}-${randomBlock(4)}`;
}

export interface CreatePromoResult {
  codes?: string[];
  error?: string;
}

export async function createPromoCodes(
  count: number,
  note: string,
  months: number = PREMIUM_DURATION_MONTHS
): Promise<CreatePromoResult> {
  const admin = await requireAdmin();
  const howMany = Math.trunc(count);
  if (!(howMany >= 1 && howMany <= 100)) return { error: "1-ээс 100 хүртэл код үүсгэж болно." };
  if (!(months >= 1 && months <= 24)) return { error: "Хугацаа 1-24 сар байна." };

  const cleanNote = note.trim().slice(0, 120) || null;
  const codes = new Set<string>();
  while (codes.size < howMany) codes.add(newCode());

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").insert(
    [...codes].map((code) => ({ code, note: cleanNote, months, created_by: admin.id }))
  );
  if (error) {
    // 23505: a random code collided with an existing one; vanishingly rare.
    return {
      error:
        error.code === "23505"
          ? "Давхардсан код гарлаа. Дахин дарна уу."
          : `Код үүсгэж чадсангүй (${error.code ?? error.message}).`,
    };
  }

  revalidatePath("/admin/promo");
  return { codes: [...codes] };
}

/** Stops an unused code from working; used ones are left as a record. */
export async function revokePromoCode(code: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("promo_codes")
    .update({ revoked_at: new Date().toISOString() })
    .eq("code", code)
    .is("redeemed_by", null);
  if (error) return { error: error.message };
  revalidatePath("/admin/promo");
  return {};
}
