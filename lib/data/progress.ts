import { createClient } from "@/lib/supabase/server";
import { canAccessLesson } from "@/lib/access";
import type { Course, Enrollment, LessonOutline, Profile } from "@/lib/types";

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
  /** Next unfinished lesson the viewer can actually open, if any. */
  nextLessonId: string | null;
}

export async function getDashboardCourses(
  profile: Profile
): Promise<DashboardCourse[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", profile.id)
    .order("enrolled_at", { ascending: false });

  const rows = (enrollments as unknown as (Enrollment & { courses: Course })[]) ?? [];
  if (rows.length === 0) return [];

  const courseIds = rows.map((r) => r.courses.id);

  // Outline view: totals must include lessons this user cannot open yet.
  const { data: lessons } = await supabase
    .from("lesson_outline")
    .select("*")
    .in("course_id", courseIds)
    .order("order_index", { ascending: true });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", profile.id);

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const lessonsByCourse = new Map<string, LessonOutline[]>();
  for (const l of lessons ?? []) {
    const list = lessonsByCourse.get(l.course_id) ?? [];
    list.push(l);
    lessonsByCourse.set(l.course_id, list);
  }

  return rows.map((row) => {
    const courseLessons = lessonsByCourse.get(row.courses.id) ?? [];
    const nextLesson = courseLessons.find(
      (l) => !completedLessonIds.has(l.id) && canAccessLesson(l, profile)
    );
    return {
      enrollment: row,
      course: row.courses,
      totalLessons: courseLessons.length,
      completedLessons: courseLessons.filter((l) => completedLessonIds.has(l.id))
        .length,
      nextLessonId: nextLesson?.id ?? null,
    };
  });
}
