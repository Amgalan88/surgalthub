"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PASS_THRESHOLD = 0.7;

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

export interface QuizResult {
  score: number;
  passed: boolean;
  total: number;
  correctCount: number;
  submitted: boolean;
  error?: string;
}

export async function submitQuiz(
  _prevState: QuizResult,
  formData: FormData
): Promise<QuizResult> {
  const courseId = String(formData.get("course_id") ?? "");
  const courseSlug = String(formData.get("course_slug") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { score: 0, passed: false, total: 0, correctCount: 0, submitted: false, error: "Нэвтэрч орно уу." };
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) {
    return { score: 0, passed: false, total: 0, correctCount: 0, submitted: false, error: "Та энэ курст бүртгэлгүй байна." };
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("course_id", courseId);

  if (!questions || questions.length === 0) {
    return { score: 0, passed: false, total: 0, correctCount: 0, submitted: false, error: "Шалгалтын асуулт олдсонгүй." };
  }

  let correctCount = 0;
  for (const q of questions) {
    const submitted = formData.get(`q_${q.id}`);
    if (submitted !== null && Number(submitted) === q.correct_index) {
      correctCount += 1;
    }
  }

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = correctCount / questions.length >= PASS_THRESHOLD;

  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    course_id: courseId,
    score,
    passed,
  });

  if (passed) {
    await supabase
      .from("enrollments")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("course_id", courseId);

    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!existingCert) {
      const certificateNo = `CA-${courseId.slice(0, 4)}-${user.id.slice(0, 4)}-${Date.now()
        .toString(36)
        .toUpperCase()}`.toUpperCase();

      await supabase.from("certificates").insert({
        user_id: user.id,
        course_id: courseId,
        certificate_no: certificateNo,
      });
    }
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}/quiz`);
  revalidatePath("/dashboard");

  return { score, passed, total: questions.length, correctCount, submitted: true };
}
