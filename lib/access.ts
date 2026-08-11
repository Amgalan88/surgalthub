import type { Course, Enrollment, Lesson, Profile } from "@/lib/types";

export function canAccessLesson(
  lesson: Lesson,
  course: Course,
  enrollment: Enrollment | null,
  profile: Profile | null
): boolean {
  if (profile?.role === "admin") return true;
  if ((course.price ?? 0) <= 0) return true;
  if (lesson.is_free_preview) return true;
  return enrollment?.has_paid ?? false;
}

export function formatMNT(amount: number | null | undefined): string {
  if (!amount || amount <= 0) return "Үнэгүй";
  return `${amount.toLocaleString("mn-MN")}₮`;
}
