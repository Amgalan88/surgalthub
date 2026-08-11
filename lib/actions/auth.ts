"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
}

export interface RequestResetState {
  error?: string;
  sent?: boolean;
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!fullName || !phone || !email || !password) {
    return { error: "Бүх талбарыг бөглөнө үү." };
  }
  if (password.length < 6) {
    return { error: "Нууц үг доод тал нь 6 тэмдэгт байх ёстой." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      error:
        "Бүртгэл амжилттай. И-мэйлээ шалгаж, холбоосоор баталгаажуулна уу.",
    };
  }

  redirect(next);
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "И-мэйл болон нууц үгээ оруулна уу." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "И-мэйл эсвэл нууц үг буруу байна." };
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "И-мэйлээ оруулна уу." };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // Supabase intentionally doesn't reveal whether the email is registered,
  // so any non-validation error here is unexpected (rate limit, bad config).
  if (error) {
    return { error: "Илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу." };
  }

  return { sent: true };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "Нууц үг доод тал нь 6 тэмдэгт байх ёстой." };
  }
  if (password !== confirmPassword) {
    return { error: "Нууц үг таарахгүй байна." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Нууц үг шинэчлэхэд алдаа гарлаа. Холбоосоо дахин ашиглаж үзнэ үү." };
  }

  redirect("/login?reset=success");
}
