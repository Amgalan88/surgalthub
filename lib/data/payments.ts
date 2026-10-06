import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentRequest } from "@/lib/types";

/** The learner's most recent "I've paid" request, to show where it stands. */
export async function getMyLatestPaymentRequest(
  userId: string
): Promise<PaymentRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** A pending request plus who sent it, resolved for the admin banner. */
export interface PendingPaymentRequest extends PaymentRequest {
  fullName: string | null;
  phone: string | null;
  email: string | null;
  /** Already on Premium, so approving extends it rather than starting it. */
  renewing: boolean;
}

export async function getPendingPaymentRequests(): Promise<PendingPaymentRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_requests")
    .select(
      "*, profiles!payment_requests_user_id_fkey(full_name, phone, premium_until)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows =
    (data as unknown as (PaymentRequest & {
      profiles: {
        full_name: string | null;
        phone: string | null;
        premium_until: string | null;
      } | null;
    })[]) ?? [];

  if (rows.length === 0) return [];

  // Email lives in auth.users, which only the service-role client can read.
  // The banner still works without it, so a missing key is not fatal.
  const emailById = new Map<string, string | null>();
  try {
    const adminClient = createAdminClient();
    await Promise.all(
      rows.map(async (row) => {
        const { data: res } = await adminClient.auth.admin.getUserById(row.user_id);
        emailById.set(row.user_id, res.user?.email ?? null);
      })
    );
  } catch (err) {
    console.error("getPendingPaymentRequests: falling back without email", err);
  }

  return rows.map(({ profiles, ...row }) => ({
    ...row,
    fullName: profiles?.full_name ?? null,
    phone: profiles?.phone ?? null,
    renewing: profiles?.premium_until
      ? new Date(profiles.premium_until).getTime() > Date.now()
      : false,
    email: emailById.get(row.user_id) ?? null,
  }));
}

export async function countPendingPaymentRequests(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("payment_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
