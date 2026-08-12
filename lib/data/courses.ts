import { createClient } from "@/lib/supabase/server";
import type { Course, CourseTrack, Lesson } from "@/lib/types";

/** A course plus the summary numbers the catalog card needs. */
export interface CourseWithMeta extends Course {
  lessonCount: number;
  hasPremiumLessons: boolean;
}

export async function getPublishedCourses(
  track?: CourseTrack
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

    const { data: lessons } = await supabase
      .from("lessons")
      .select("course_id, is_free_preview")
      .in(
        "course_id",
        courses.map((c) => c.id)
      );

    const counts = new Map<string, number>();
    const premium = new Set<string>();
    for (const lesson of lessons ?? []) {
      counts.set(lesson.course_id, (counts.get(lesson.course_id) ?? 0) + 1);
      if (!lesson.is_free_preview) premium.add(lesson.course_id);
    }

    return courses.map((course) => ({
      ...course,
      lessonCount: counts.get(course.id) ?? 0,
      hasPremiumLessons: premium.has(course.id),
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
