import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, LessonOutline } from "@/lib/types";

/** A course plus its lesson outline and the summary numbers listings need. */
export interface CourseWithMeta extends Course {
  /** Every lesson in order, locked ones included (titles only, no content). */
  lessons: LessonOutline[];
  lessonCount: number;
  freeLessonCount: number;
  hasPremiumLessons: boolean;
  /** Viewer-specific; both stay at their defaults when nobody is signed in. */
  enrolled: boolean;
  completedLessons: number;
  completedLessonIds: string[];
}

/**
 * Published courses in the order they were added, which is the order they are
 * meant to be taken in.
 */
export async function getPublishedCourses(
  userId?: string
): Promise<CourseWithMeta[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const courses = data ?? [];
    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);
    // The outline view lists locked lessons too, so totals stay honest.
    const { data: lessons } = await supabase
      .from("lesson_outline")
      .select("*")
      .in("course_id", courseIds)
      .order("order_index", { ascending: true });

    const lessonsByCourse = new Map<string, LessonOutline[]>();
    for (const lesson of lessons ?? []) {
      const list = lessonsByCourse.get(lesson.course_id) ?? [];
      list.push(lesson);
      lessonsByCourse.set(lesson.course_id, list);
    }

    const enrolledIds = new Set<string>();
    let completedLessonIds = new Set<string>();
    if (userId) {
      const [{ data: enrollments }, { data: progress }] = await Promise.all([
        supabase
          .from("enrollments")
          .select("course_id")
          .eq("user_id", userId)
          .in("course_id", courseIds),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
      ]);

      for (const row of enrollments ?? []) enrolledIds.add(row.course_id);
      completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
    }

    return courses.map((course) => {
      const courseLessons = lessonsByCourse.get(course.id) ?? [];
      const completed = courseLessons
        .filter((l) => completedLessonIds.has(l.id))
        .map((l) => l.id);
      const freeLessonCount = courseLessons.filter((l) => l.is_free_preview).length;
      return {
        ...course,
        lessons: courseLessons,
        lessonCount: courseLessons.length,
        freeLessonCount,
        hasPremiumLessons: freeLessonCount < courseLessons.length,
        enrolled: enrolledIds.has(course.id),
        completedLessons: completed.length,
        completedLessonIds: completed,
      };
    });
  } catch (err) {
    console.error("getPublishedCourses failed:", err);
    return [];
  }
}

/** Memoised per request: generateMetadata and the page both need it. */
export const getCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("getCourseBySlug failed:", err);
    return null;
  }
});

/**
 * Full lesson rows. RLS only returns the ones the caller may actually read,
 * so use this when the paid content itself is needed — not for listings.
 */
export async function getLessonsForCourse(courseId: string): Promise<Lesson[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("getLessonsForCourse failed:", err);
    return [];
  }
}

/**
 * Titles and ordering for every lesson in the course, including locked ones.
 * Carries no paid content, so it is what roadmaps and sidebars should render.
 */
export const getLessonOutline = cache(async (
  courseId: string
): Promise<LessonOutline[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lesson_outline")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("getLessonOutline failed:", err);
    return [];
  }
});

/** Single full lesson, or null when RLS says the caller may not read it. */
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("getLessonById failed:", err);
    return null;
  }
}

/** 1-based position of a course in the published curriculum, or null. */
export const getCoursePosition = cache(async (courseId: string): Promise<number | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id")
      .eq("published", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const index = (data ?? []).findIndex((c) => c.id === courseId);
    return index === -1 ? null : index + 1;
  } catch (err) {
    console.error("getCoursePosition failed:", err);
    return null;
  }
});

/** The published course that follows this one in the curriculum, if any. */
export async function getNextCourse(
  courseId: string
): Promise<Pick<Course, "slug" | "title"> | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("published", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const list = data ?? [];
    const index = list.findIndex((c) => c.id === courseId);
    const next = index === -1 ? undefined : list[index + 1];
    return next ? { slug: next.slug, title: next.title } : null;
  } catch (err) {
    console.error("getNextCourse failed:", err);
    return null;
  }
}
