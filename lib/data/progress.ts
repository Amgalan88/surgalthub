import { createClient } from "@/lib/supabase/server";

/**
 * Opening a lesson is what joins a course; there is no separate "enroll" step
 * for learners to miss. Idempotent, so it is safe on every lesson view.
 */
export async function ensureEnrollment(userId: string, courseId: string) {
  const supabase = await createClient();
  await supabase
    .from("enrollments")
    .upsert(
      { user_id: userId, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );
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
