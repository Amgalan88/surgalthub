import { createClient } from "@/lib/supabase/server";
import type { Course, CourseTrack, Lesson } from "@/lib/types";

export async function getPublishedCourses(track?: CourseTrack): Promise<Course[]> {
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
    return data ?? [];
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
