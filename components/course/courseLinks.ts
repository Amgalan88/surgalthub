import { canAccessLesson, isPremiumActive } from "@/lib/access";
import type { LessonOutline, Profile } from "@/lib/types";

export function lessonHref(courseSlug: string, lessonId: string) {
  return `/courses/${courseSlug}/learn/${lessonId}`;
}

/**
 * Where a course's main button should take this viewer, and what it says:
 * the next lesson they can open, or the Premium page when nothing is left.
 */
export function primaryCourseAction(
  courseSlug: string,
  lessons: LessonOutline[],
  completedIds: ReadonlySet<string>,
  profile: Profile | null
): { href: string; label: string } {
  const next = lessons.find(
    (l) => !completedIds.has(l.id) && canAccessLesson(l, profile)
  );
  const started = lessons.some((l) => completedIds.has(l.id));
  const unlimited = profile?.role === "admin" || isPremiumActive(profile);

  if (next) {
    if (started) return { href: lessonHref(courseSlug, next.id), label: "Үргэлжлүүлэх" };
    return {
      href: lessonHref(courseSlug, next.id),
      label: next.is_free_preview && !unlimited ? "Үнэгүй хичээл үзэх" : "Эхлэх",
    };
  }
  if (lessons.length > 0 && lessons.every((l) => completedIds.has(l.id))) {
    return { href: lessonHref(courseSlug, lessons[0].id), label: "Дахин үзэх" };
  }
  return { href: "/premium", label: "Premium-аар нээх" };
}

export function courseNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}
