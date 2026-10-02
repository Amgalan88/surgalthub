"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, hasConfiguredSiteUrl, safeNextPath } from "@/lib/site";

export interface AuthFormState {
  error?: string;
  /** Non-error outcome worth showing, e.g. "check your inbox". */
  notice?: string;
}

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Origin for links sent by email. The configured site URL wins, because a
 * request header is attacker-controlled; the header is only a fallback for
 * hosts where nothing is configured (Supabase still checks it against the
 * project's allowed redirect URLs).
 */
async function emailLinkOrigin(): Promise<string> {
  if (hasConfiguredSiteUrl()) return getSiteUrl();
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

/** Supabase returns English messages; learners should never see those. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Энэ и-мэйлээр бүртгэл аль хэдийн үүссэн байна. Нэвтэрч орно уу.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Хэт олон оролдлого хийлээ. Хэдэн минутын дараа дахин оролдоно уу.";
  }
  if (m.includes("password")) {
    return `Нууц үг доод тал нь ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой.`;
  }
  if (m.includes("email") && m.includes("invalid")) {
    return "И-мэйл хаяг буруу байна.";
  }
  return "Алдаа гарлаа. Дахин оролдоно уу.";
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!fullName || !phone || !email || !password) {
    return { error: "Бүх талбарыг бөглөнө үү." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "И-мэйл хаяг буруу байна." };
  }
  if (!/^\+?[0-9\s-]{8,15}$/.test(phone)) {
    return { error: "Утасны дугаараа зөв оруулна уу (жишээ нь 99112233)." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Нууц үг доод тал нь ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${await emailLinkOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.session) {
    return {
      notice:
        "Бүртгэл амжилттай үүслээ. И-мэйлээ шалгаж, ирсэн холбоосоор баталгаажуулаад нэвтэрнэ үү.",
    };
  }

  redirect(next);
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "И-мэйл болон нууц үгээ оруулна уу." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("not confirmed")) {
      return {
        error: "И-мэйл хаягаа баталгаажуулаагүй байна. Ирсэн холбоосоор баталгаажуулна уу.",
      };
    }
    if (error.status === 429) {
      return { error: translateAuthError("rate limit") };
    }
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { error: "И-мэйлээ зөв оруулна уу." };
  }

  const supabase = await createClient();
  // The reset link goes out by email, so its origin must not come from a
  // request header an attacker controls.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await emailLinkOrigin()}/auth/confirm?next=/reset-password`,
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

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Нууц үг доод тал нь ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой.` };
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
