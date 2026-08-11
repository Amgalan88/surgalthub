"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setEnrollmentPaid(
  courseId: string,
  enrollmentId: string,
  paid: boolean
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("enrollments").update({ has_paid: paid }).eq("id", enrollmentId);
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}
