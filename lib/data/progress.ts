import { createClient } from "@/lib/supabase/server";
import type { Course, Enrollment } from "@/lib/types";

export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data;
}

export async function getCompletedLessonIds(
  userId: string,
  lessonIds: string[]
): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

export interface DashboardCourse {
  enrollment: Enrollment;
  course: Course;
  totalLessons: number;
  completedLessons: number;
}

export async function getDashboardCourses(
  userId: string
): Promise<DashboardCourse[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  const rows = (enrollments as unknown as (Enrollment & { courses: Course })[]) ?? [];
  if (rows.length === 0) return [];

  const courseIds = rows.map((r) => r.courses.id);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", courseIds);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons ?? []) {
    const list = lessonsByCourse.get(l.course_id) ?? [];
    list.push(l.id);
    lessonsByCourse.set(l.course_id, list);
  }

  return rows.map((row) => {
    const courseLessonIds = lessonsByCourse.get(row.courses.id) ?? [];
    return {
      enrollment: row,
      course: row.courses,
      totalLessons: courseLessonIds.length,
      completedLessons: courseLessonIds.filter((id) => completedLessonIds.has(id))
        .length,
    };
  });
}
