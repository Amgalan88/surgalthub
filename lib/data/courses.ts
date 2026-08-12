import { createClient } from "@/lib/supabase/server";
import type { Course, CourseTrack, Lesson } from "@/lib/types";

/** A course plus the summary numbers the catalog card needs. */
export interface CourseWithMeta extends Course {
  lessonCount: number;
  freeLessonCount: number;
  hasPremiumLessons: boolean;
  /** Viewer-specific; both stay at their defaults when nobody is signed in. */
  enrolled: boolean;
  completedLessons: number;
}

export async function getPublishedCourses(
  track?: CourseTrack,
  userId?: string
): Promise<CourseWithMeta[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (track) query = query.eq("track", track);

    const { data, error } = await query;
    if (error) throw error;

    const courses = data ?? [];
    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, course_id, is_free_preview")
      .in("course_id", courseIds);

    const counts = new Map<string, number>();
    const freeCounts = new Map<string, number>();
    const premium = new Set<string>();
    for (const lesson of lessons ?? []) {
      counts.set(lesson.course_id, (counts.get(lesson.course_id) ?? 0) + 1);
      if (lesson.is_free_preview) {
        freeCounts.set(
          lesson.course_id,
          (freeCounts.get(lesson.course_id) ?? 0) + 1
        );
      } else {
        premium.add(lesson.course_id);
      }
    }

    const enrolledIds = new Set<string>();
    const completedByCourse = new Map<string, number>();
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

      const completedLessonIds = new Set(
        (progress ?? []).map((p) => p.lesson_id)
      );
      for (const lesson of lessons ?? []) {
        if (!completedLessonIds.has(lesson.id)) continue;
        completedByCourse.set(
          lesson.course_id,
          (completedByCourse.get(lesson.course_id) ?? 0) + 1
        );
      }
    }

    return courses.map((course) => ({
      ...course,
      lessonCount: counts.get(course.id) ?? 0,
      freeLessonCount: freeCounts.get(course.id) ?? 0,
      hasPremiumLessons: premium.has(course.id),
      enrolled: enrolledIds.has(course.id),
      completedLessons: completedByCourse.get(course.id) ?? 0,
    }));
  } catch (err) {
    console.error("getPublishedCourses failed:", err);
    return [];
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("getCourseBySlug failed:", err);
    return null;
  }
}

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
