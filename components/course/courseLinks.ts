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
): { href: string; label: string; locked: boolean } {
  const next = lessons.find(
    (l) => !completedIds.has(l.id) && canAccessLesson(l, profile)
  );
  const started = lessons.some((l) => completedIds.has(l.id));
  const unlimited = profile?.role === "admin" || isPremiumActive(profile);

  if (next) {
    if (started) {
      return { href: lessonHref(courseSlug, next.id), label: "Үргэлжлүүлэх", locked: false };
    }
    return {
      href: lessonHref(courseSlug, next.id),
      label: next.is_free_preview && !unlimited ? "Үнэгүй хичээл үзэх" : "Эхлэх",
      locked: false,
    };
  }
  if (lessons.length > 0 && lessons.every((l) => completedIds.has(l.id))) {
    return { href: lessonHref(courseSlug, lessons[0].id), label: "Дахин үзэх", locked: false };
  }
  return { href: "/premium", label: "Premium-аар нээх", locked: true };
}

export function courseNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

/**
 * The lesson a viewer should watch next across the whole curriculum: the first
 * unfinished lesson they can open, in course order. Falls back to the first
 * course when everything open to them is already watched.
 */
export function nextInCurriculum<
  C extends { slug: string; lessons: LessonOutline[]; completedLessonIds: string[] },
>(
  courses: C[],
  profile: Profile | null
): {
  course: C;
  index: number;
  lesson: LessonOutline | null;
  href: string;
  label: string;
  locked: boolean;
} | null {
  if (courses.length === 0) return null;

  for (const [index, course] of courses.entries()) {
    const done = new Set(course.completedLessonIds);
    const lesson = course.lessons.find((l) => !done.has(l.id) && canAccessLesson(l, profile));
    if (lesson) {
      const action = primaryCourseAction(course.slug, course.lessons, done, profile);
      return { course, index, lesson, ...action };
    }
  }

  const course = courses[0];
  const action = primaryCourseAction(
    course.slug,
    course.lessons,
    new Set(course.completedLessonIds),
    profile
  );
  return { course, index: 0, lesson: course.lessons[0] ?? null, ...action };
}
