import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Зөвшөөрөгдөөгүй үйлдэл.");
  }
  return profile;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      id: user.id,
      full_name: null,
      role: "user",
      phone: null,
      premium_until: null,
      created_at: user.created_at ?? new Date().toISOString(),
    };
  }

  return profile;
}
