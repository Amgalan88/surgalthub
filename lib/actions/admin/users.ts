"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
