"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) {
    return { error: "Нэрээ оруулна уу." };
  }
  if (fullName.length > 80) {
    return { error: "Нэр хэт урт байна." };
  }
  if (phone && !/^\+?[0-9\s-]{8,15}$/.test(phone)) {
    return { error: "Утасны дугаараа зөв оруулна уу (жишээ нь 99112233)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтэрч орно уу." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed:", error);
    return { error: "Хадгалж чадсангүй. Дахин оролдоно уу." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
