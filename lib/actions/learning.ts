"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/site";

export async function enrollInCourse(courseSlug: string, courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses/${encodeURIComponent(courseSlug)}`);

  await supabase
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard");
}

/**
 * Records the lesson as done and, when that was the last one, stamps the
 * enrollment as completed. `continueTo` is where to send the learner next
 * (usually the following lesson); null keeps them on the page.
 */
export async function markLessonComplete(
  courseSlug: string,
  lessonId: string,
  continueTo: string | null = null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS only lets a learner read lessons they may open, so this doubles as the
  // access check — progress can never be recorded for a locked lesson.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) redirect(`/courses/${courseSlug}?locked=1`);

  await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );

  await stampCourseCompletion(user.id, lesson.course_id);

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
  revalidatePath("/dashboard");

  if (continueTo) redirect(safeNextPath(continueTo, `/courses/${courseSlug}`));
}

async function stampCourseCompletion(userId: string, courseId: string) {
  const supabase = await createClient();

  const [{ data: outline }, { data: enrollment }] = await Promise.all([
    supabase.from("lesson_outline").select("id").eq("course_id", courseId),
    supabase
      .from("enrollments")
      .select("id, completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle(),
  ]);

  if (!enrollment || enrollment.completed_at || !outline?.length) return;

  const { count } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in(
      "lesson_id",
      outline.map((l) => l.id)
    );

  if ((count ?? 0) >= outline.length) {
    await supabase
      .from("enrollments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", enrollment.id);
  }
}
