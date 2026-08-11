import type { Lesson, Profile } from "@/lib/types";

export const PREMIUM_PRICE_MNT = 120_000;
export const PREMIUM_DURATION_MONTHS = 6;

export const PAYMENT_INFO = {
  bank: "Хаан банк",
  account: "5119007473",
  accountHolder: "Энхамгалан",
};

export function isPremiumActive(profile: Profile | null): boolean {
  if (!profile?.premium_until) return false;
  return new Date(profile.premium_until).getTime() > Date.now();
}

export function canAccessLesson(
  lesson: Lesson,
  profile: Profile | null,
  alreadyCompleted = false
): boolean {
  if (profile?.role === "admin") return true;
  if (lesson.is_free_preview) return true;
  if (alreadyCompleted) return true;
  return isPremiumActive(profile);
}

export function formatMNT(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}
