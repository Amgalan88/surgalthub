"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enrollInCourse(courseSlug: string, courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтэрч орно уу.");

  await supabase
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );

  revalidatePath(`/courses/${courseSlug}`);
}

export async function markLessonComplete(
  courseSlug: string,
  lessonId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтэрч орно уу.");

  await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
}
