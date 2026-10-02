import { createClient } from "@/lib/supabase/server";
import type { PaymentRequest } from "@/lib/types";

/**
 * Postgres / PostgREST codes for "that table does not exist", i.e. migration
 * 0011 has not been run yet. Pages then fall back to the old manual flow.
 */
function isMissingTable(error: { code?: string } | null) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

export interface MyPaymentState {
  /** False until migration 0011 is applied; the "I have paid" flow hides itself. */
  available: boolean;
  pending: PaymentRequest | null;
  /** The latest request, when it was turned down and nothing newer exists. */
  rejected: PaymentRequest | null;
}

export async function getMyPaymentState(userId: string): Promise<MyPaymentState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    if (!isMissingTable(error)) console.error("getMyPaymentState failed:", error);
    return { available: !isMissingTable(error), pending: null, rejected: null };
  }

  const latest = data?.[0] ?? null;
  return {
    available: true,
    pending: latest?.status === "pending" ? latest : null,
    rejected: latest?.status === "rejected" ? latest : null,
  };
}

export interface AdminPaymentRequest extends PaymentRequest {
  fullName: string | null;
  phone: string | null;
  premiumUntil: string | null;
  /** The learner still has Premium, so approving extends it. */
  renewing: boolean;
}

export async function getPaymentRequestsAdmin(): Promise<{
  available: boolean;
  pending: AdminPaymentRequest[];
  reviewed: AdminPaymentRequest[];
}> {
  const supabase = await createClient();
  const select =
    "*, profiles:profiles!payment_requests_user_id_fkey(full_name, phone, premium_until)";

  const [pendingRes, reviewedRes] = await Promise.all([
    supabase
      .from("payment_requests")
      .select(select)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("payment_requests")
      .select(select)
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(30),
  ]);

  const error = pendingRes.error ?? reviewedRes.error;
  if (error) {
    if (!isMissingTable(error)) console.error("getPaymentRequestsAdmin failed:", error);
    return { available: !isMissingTable(error), pending: [], reviewed: [] };
  }

  type Row = PaymentRequest & {
    profiles: { full_name: string | null; phone: string | null; premium_until: string | null } | null;
  };
  const now = Date.now();
  const shape = (rows: unknown): AdminPaymentRequest[] =>
    ((rows as Row[] | null) ?? []).map(({ profiles, ...row }) => ({
      ...row,
      fullName: profiles?.full_name ?? null,
      phone: profiles?.phone ?? null,
      premiumUntil: profiles?.premium_until ?? null,
      renewing: profiles?.premium_until
        ? new Date(profiles.premium_until).getTime() > now
        : false,
    }));

  return { available: true, pending: shape(pendingRes.data), reviewed: shape(reviewedRes.data) };
}

/** Open requests waiting on the admin; 0 when the table is not there yet. */
export async function getPendingPaymentCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("payment_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}
