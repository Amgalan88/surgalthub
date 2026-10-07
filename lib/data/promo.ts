import { createClient } from "@/lib/supabase/server";
import type { PromoCode } from "@/lib/types";

export interface AdminPromoCode extends PromoCode {
  redeemerName: string | null;
  redeemerPhone: string | null;
}

/**
 * Every promo code, newest first. `available` is false until migration 0015
 * has been run (missing table, or the API was never granted it).
 */
export async function getPromoCodesAdmin(): Promise<{
  available: boolean;
  codes: AdminPromoCode[];
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*, redeemer:profiles!promo_codes_redeemed_by_fkey(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    const setupNeeded = ["42P01", "PGRST205", "42501"].includes(error.code ?? "");
    if (!setupNeeded) console.error("getPromoCodesAdmin failed:", error);
    return { available: !setupNeeded, codes: [] };
  }

  type Row = PromoCode & { redeemer: { full_name: string | null; phone: string | null } | null };
  return {
    available: true,
    codes: ((data as unknown as Row[]) ?? []).map(({ redeemer, ...row }) => ({
      ...row,
      redeemerName: redeemer?.full_name ?? null,
      redeemerPhone: redeemer?.phone ?? null,
    })),
  };
}
