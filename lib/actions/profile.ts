"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAvatarKey } from "@/lib/avatars";

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

/** Saves the learner's animal avatar in their auth metadata (no table change needed). */
export async function updateAvatar(avatar: string): Promise<{ error?: string }> {
  if (!isAvatarKey(avatar)) return { error: "Ийм аватар алга." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { avatar } });
  if (error) {
    console.error("updateAvatar failed:", error);
    return { error: "Хадгалж чадсангүй. Дахин оролдоно уу." };
  }

  revalidatePath("/", "layout");
  return {};
}
