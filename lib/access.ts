import type { Profile } from "@/lib/types";

/** Everything the access check needs — satisfied by both Lesson and LessonOutline. */
type AccessibleLesson = { is_free_preview: boolean };

export const PREMIUM_PRICE_MNT = 120_000;
export const PREMIUM_DURATION_MONTHS = 6;

export const PAYMENT_INFO = {
  bank: "Хаан банк",
  account: "5119007473",
  accountHolder: "Энхамгалан",
};

/** Warn the user their access is running out once it is this close to expiring. */
export const PREMIUM_EXPIRY_WARNING_DAYS = 14;

export function isPremiumActive(profile: Profile | null): boolean {
  if (!profile?.premium_until) return false;
  return new Date(profile.premium_until).getTime() > Date.now();
}

/** Whole days left on the subscription, or null when it is absent or already over. */
export function premiumDaysRemaining(profile: Profile | null): number | null {
  if (!profile?.premium_until) return null;
  const remainingMs = new Date(profile.premium_until).getTime() - Date.now();
  if (remainingMs <= 0) return null;
  return Math.ceil(remainingMs / 86_400_000);
}

export function formatPremiumDate(value: string): string {
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function canAccessLesson(
  lesson: AccessibleLesson,
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
